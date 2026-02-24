"use client";

import NeumoCard from "@/components/NeumoCard";
import { withDashboardLayout } from "@/components/layouts/withDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Target, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface GoalRow {
  id: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  targetConversions: number;
  targetRevenue: number;
  realizedConversions: number;
  realizedRevenue: number;
  user: { id: string; name: string; email: string };
}

function StatsPageInner() {
  const { user: authUser } = useAuth();
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const fetchGoals = async (withLoading: boolean = false) => {
    try {
      if (withLoading) setLoading(true);
      const res = await fetch("/api/goals", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setGoals(data);
    } catch {
      // silencieux
    } finally {
      if (withLoading) setLoading(false);
    }
  };

  // Chargement initial des objectifs
  useEffect(() => {
    void fetchGoals(true);
  }, []);

  // Rafraîchir les objectifs quand une conversion a eu lieu (événement global)
  useEffect(() => {
    const handler = () => {
      void fetchGoals(false);
    };
    window.addEventListener("crm:goals-invalidate", handler);
    return () => window.removeEventListener("crm:goals-invalidate", handler);
  }, []);

  const isManagerOrAdmin =
    authUser?.role === "admin" || authUser?.role === "manager";
  const isAgent = authUser?.role === "agent";
  const currentPeriodGoal =
    isAgent && goals.length > 0
      ? goals.find((g) => {
          const end = new Date(g.periodEnd);
          const start = new Date(g.periodStart);
          const now = new Date();
          return now >= start && now <= end;
        }) ?? goals[0]
      : null;

  const handleRenew = async (goal: GoalRow) => {
    try {
      setRenewingId(goal.id);
      const res = await fetch(`/api/goals/${goal.id}/renew`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        window.alert(
          (data && data.error) ||
            "Impossible de reconduire cet objectif. Veuillez réessayer."
        );
        return;
      }
      await fetchGoals(false);
    } catch {
      window.alert(
        "Une erreur est survenue lors de la reconduction de l'objectif."
      );
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <>
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-primary">
            Statistiques
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Suivi des performances commerciales, taux de conversion et objectifs.
          </p>
        </div>
      </section>

      {isAgent && (
        <section className="mt-4">
          {currentPeriodGoal ? (
            <NeumoCard className="p-5 bg-[#f5f5ff] border-2 border-primary/20">
              <p className="text-xs font-semibold text-primary mb-3">
                Mon objectif ({currentPeriodGoal.periodLabel})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-2">
                  <span className="text-gray-500">Conversions</span>
                  <p className="font-semibold text-primary">
                    {currentPeriodGoal.realizedConversions} /{" "}
                    {currentPeriodGoal.targetConversions}
                    {currentPeriodGoal.realizedConversions >=
                      currentPeriodGoal.targetConversions && (
                      <span className="text-emerald-600 ml-1">✓</span>
                    )}
                  </p>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${
                          currentPeriodGoal.targetConversions > 0
                            ? Math.min(
                                100,
                                (currentPeriodGoal.realizedConversions /
                                  currentPeriodGoal.targetConversions) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-500">CA</span>
                  <p className="font-semibold text-primary">
                    {currentPeriodGoal.realizedRevenue.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                      maximumFractionDigits: 0,
                    })}{" "}
                    /{" "}
                    {currentPeriodGoal.targetRevenue.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                      maximumFractionDigits: 0,
                    })}
                    {currentPeriodGoal.realizedRevenue >=
                      currentPeriodGoal.targetRevenue && (
                      <span className="text-emerald-600 ml-1">✓</span>
                    )}
                  </p>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${
                          currentPeriodGoal.targetRevenue > 0
                            ? Math.min(
                                100,
                                (currentPeriodGoal.realizedRevenue /
                                  currentPeriodGoal.targetRevenue) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </NeumoCard>
          ) : goals.length > 0 ? (
            <NeumoCard className="p-5 bg-white">
              <p className="text-xs font-semibold text-primary mb-2">
                Mes objectifs
              </p>
              <p className="text-[11px] text-gray-500">
                Aucun objectif pour la période en cours. Consultez le tableau
                ci-dessous pour l’historique.
              </p>
            </NeumoCard>
          ) : null}
        </section>
      )}

      {loading ? (
        <div className="mt-4 text-sm text-gray-500">Chargement des objectifs…</div>
      ) : goals.length === 0 ? (
        <NeumoCard className="mt-4 p-5 bg-white">
          <p className="text-sm text-gray-500">
            Aucun objectif défini. Les managers et admins peuvent définir des
            objectifs depuis la page Utilisateurs (action « Définir objectif »
            sur un commercial).
          </p>
        </NeumoCard>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NeumoCard className="p-4 bg-white flex flex-col gap-2">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Objectifs définis
              </span>
              <span className="text-2xl font-semibold text-primary">
                {goals.length}
              </span>
              <span className="text-[11px] text-gray-400">
                Périodes avec objectif conversions + CA
              </span>
            </NeumoCard>
            <NeumoCard className="p-4 bg-white flex flex-col gap-2">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Commerciaux concernés
              </span>
              <span className="text-2xl font-semibold text-primary">
                {new Set(goals.map((g) => g.user.id)).size}
              </span>
              <span className="text-[11px] text-gray-400">
                Avec au moins un objectif
              </span>
            </NeumoCard>
            <NeumoCard className="p-4 bg-white flex flex-col gap-2">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Conversions (total réalisé)
              </span>
              <span className="text-2xl font-semibold text-primary">
                {goals.reduce((s, g) => s + g.realizedConversions, 0)}
              </span>
              <span className="text-[11px] text-gray-400">
                Objectif total :{" "}
                {goals.reduce((s, g) => s + g.targetConversions, 0)}
              </span>
            </NeumoCard>
          </div>

          <NeumoCard className="mt-6 p-5 bg-white flex flex-col gap-4">
            <p className="text-xs font-semibold text-primary">
              {isManagerOrAdmin
                ? "Objectifs par commercial et par période"
                : "Mes objectifs (toutes périodes)"}
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="text-gray-500 border-b border-gray-100">
                  <tr>
                    {isManagerOrAdmin && (
                      <th className="py-2 text-left font-medium">Commercial</th>
                    )}
                    <th className="py-2 text-left font-medium">Période</th>
                    <th className="py-2 text-right font-medium">
                      Conversions (réalisé / objectif)
                    </th>
                    <th className="py-2 text-right font-medium">
                      CA (réalisé / objectif)
                    </th>
                    {isManagerOrAdmin && (
                      <th className="py-2 text-right font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {goals.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60"
                    >
                      {isManagerOrAdmin && (
                        <td className="py-2.5 font-medium">{g.user.name}</td>
                      )}
                      <td className="py-2.5">{g.periodLabel}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={
                            g.realizedConversions >= g.targetConversions
                              ? "text-emerald-600 font-medium"
                              : ""
                          }
                        >
                          {g.realizedConversions}
                        </span>
                        <span className="text-gray-400"> / </span>
                        <span>{g.targetConversions}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={
                            g.realizedRevenue >= g.targetRevenue
                              ? "text-emerald-600 font-medium"
                              : ""
                          }
                        >
                          {g.realizedRevenue.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "XOF",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                        <span className="text-gray-400"> / </span>
                        <span>
                          {g.targetRevenue.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "XOF",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </td>
                      {isManagerOrAdmin && (
                        <td className="py-2.5 text-right">
                          {(() => {
                            const now = new Date();
                            const end = new Date(g.periodEnd);
                            const periodFinished = now > end;
                            const conversionsNotReached =
                              g.targetConversions > 0 &&
                              g.realizedConversions < g.targetConversions;
                            const revenueNotReached =
                              g.targetRevenue > 0 &&
                              g.realizedRevenue < g.targetRevenue;
                            const canRenew =
                              periodFinished &&
                              (conversionsNotReached || revenueNotReached);

                            if (!canRenew) return null;

                            return (
                              <button
                                type="button"
                                onClick={() => handleRenew(g)}
                                disabled={renewingId === g.id}
                                className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/15 disabled:opacity-50"
                              >
                                Reconduire
                              </button>
                            );
                          })()}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NeumoCard>
        </>
      )}
    </>
  );
}

const StatsPage = withDashboardLayout(StatsPageInner);

export default StatsPage;
