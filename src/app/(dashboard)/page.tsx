"use client";

import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import NeumoCard from "@/components/NeumoCard";
import Sidebar from "@/components/Sidebar";
import SkeletonLoader from "@/components/SkeletonLoader";
import {
  ChartPieDonut,
  ChartPieDonutBySource,
} from "@/components/ui/chart-pie-donut";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** Objectif courant avec réalisé (réponse GET /api/goals/current pour un agent) */
interface CurrentGoal {
  periodLabel: string;
  targetConversions: number;
  targetRevenue: number;
  realizedConversions: number;
  realizedRevenue: number;
}

interface LeadStats {
  total: number;
  converted: number;
  conversionRate: number; // en %
}

const initialLeadStats: LeadStats = {
  total: 0,
  converted: 0,
  conversionRate: 0,
};

interface RecentLead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  createdAt?: string;
}

/** Événement émis après une conversion lead→client pour rafraîchir les objectifs */
export const GOALS_INVALIDATE_EVENT = "crm:goals-invalidate";

export default function DashboardPage() {
  const pathname = usePathname();
  const { user: authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [leadStats, setLeadStats] = useState<LeadStats>(initialLeadStats);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [currentGoal, setCurrentGoal] = useState<CurrentGoal | null>(null);
  const [goalsLoading, setGoalsLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, []);

  // Rafraîchir l'objectif courant (réalisé + barres) : via /api/goals/current
  const fetchCurrentGoal = useCallback(async () => {
    setGoalsLoading(true);
    try {
      const res = await fetch("/api/goals/current", { cache: "no-store" });
      if (!res.ok) {
        setCurrentGoal(null);
        return;
      }
      const data = await res.json();
      if (data && typeof data === "object") {
        setCurrentGoal(data);
      }
    } catch {
      setCurrentGoal(null);
    } finally {
      setGoalsLoading(false);
    }
  }, []);

  // Stats leads & derniers leads (APIs côté serveur)
  const fetchLeadStats = useCallback(async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        fetch("/api/dashboard/lead-stats", { cache: "no-store" }).catch(
          () => null,
        ),
        fetch("/api/dashboard/recent-leads", { cache: "no-store" }).catch(
          () => null,
        ),
      ]);
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setLeadStats({
          total: statsData?.total ?? 0,
          converted: statsData?.converted ?? 0,
          conversionRate: statsData?.conversionRate ?? 0,
        });
      }
      if (recentRes && recentRes.ok) {
        const recentData = (await recentRes.json()) as RecentLead[];
        setRecentLeads(Array.isArray(recentData) ? recentData : []);
      }
    } catch {
      setLeadStats(initialLeadStats);
      setRecentLeads([]);
    }
  }, []);

  useEffect(() => {
    void fetchCurrentGoal();
    void fetchLeadStats();
  }, [fetchCurrentGoal, fetchLeadStats]);

  // Réagir à l'événement global après conversion lead→client
  useEffect(() => {
    const handler = () => {
      void fetchCurrentGoal();
      void fetchLeadStats();
    };
    window.addEventListener(GOALS_INVALIDATE_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(
        GOALS_INVALIDATE_EVENT,
        handler as EventListener,
      );
  }, [fetchCurrentGoal, fetchLeadStats]);

  const isManagerOrAdmin =
    authUser?.role === "manager" || authUser?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col sm:flex-row bg-bgGray">
        <Sidebar />
        <main className="flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full">
          <Navbar />
          <SkeletonLoader />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-bgGray">
      <Sidebar />
      <main className="flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full">
        <Navbar />

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NeumoCard className="p-4 bg-linear-to-br from-primary/5 via-white to-indigo-50 flex flex-col gap-1 border border-primary/10 shadow-neu-soft">
            <span className="text-[11px] text-gray-500">Total prospects</span>
            <span className="text-2xl font-semibold text-primary">
              {leadStats.total}
            </span>
            <span className="text-[11px] text-gray-400">
              Tous les leads créés dans votre société
            </span>
          </NeumoCard>
          <NeumoCard className="p-4 bg-linear-to-br from-emerald-50 via-white to-teal-50 flex flex-col gap-1 border border-emerald-100 shadow-neu-soft">
            <span className="text-[11px] text-gray-500">
              Taux de conversion
            </span>
            <span className="text-2xl font-semibold text-primary">
              {leadStats.conversionRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-gray-400">
              Leads convertis en clients
            </span>
          </NeumoCard>
          <NeumoCard className="p-4 bg-linear-to-br from-amber-50 via-white to-orange-50 flex flex-col gap-1 border border-amber-100 shadow-neu-soft">
            <span className="text-[11px] text-gray-500">Leads convertis</span>
            <span className="text-2xl font-semibold text-primary">
              {leadStats.converted}
            </span>
            <span className="text-[11px] text-gray-400">
              Nombre de prospects devenus clients
            </span>
          </NeumoCard>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NeumoCard className="p-4 bg-white border border-gray-100 shadow-neu-soft flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-primary">
                Répartition des leads par statut
              </p>
              <button
                type="button"
                onClick={() => void fetchLeadStats()}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 px-2 py-1 text-[10px] text-primary hover:bg-primary/5"
              >
                <RefreshCw className="w-3 h-3" />
                Rafraîchir
              </button>
            </div>
            <ChartPieDonut />
          </NeumoCard>

          <NeumoCard className="p-4 bg-white border border-gray-100 shadow-neu-soft flex flex-col gap-3">
            <p className="text-xs font-semibold text-primary">
              Répartition des leads par source
            </p>
            <ChartPieDonutBySource />
          </NeumoCard>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <NeumoCard className="p-4 bg-white border border-gray-100 shadow-neu-soft lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-primary">
                Derniers leads créés
              </p>
              <Link
                href="/leads"
                className="text-[11px] text-primary hover:underline"
              >
                Voir tous les leads
              </Link>
            </div>
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-3 text-center text-gray-400"
                      >
                        Aucun lead récent.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Link
                            href={`/leads/${lead.id}`}
                            className="text-primary hover:underline"
                          >
                            {lead.firstName} {lead.lastName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {lead.email || lead.phone || "-"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {lead.status}
                        </TableCell>
                        <TableCell className="text-gray-500 text-[11px]">
                          {lead.createdAt
                            ? new Date(lead.createdAt).toLocaleDateString(
                                "fr-FR",
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </NeumoCard>

          <NeumoCard className="p-4 bg-linear-to-br from-violet-50 via-white to-primary/10 border border-violet-100 shadow-neu-soft flex flex-col gap-3">
            <p className="text-xs font-semibold text-primary flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {isManagerOrAdmin ? "Objectifs de l'équipe" : "Mon objectif"}
            </p>
            {goalsLoading ? (
              <p className="text-[11px] text-gray-500">Chargement…</p>
            ) : !currentGoal ? (
              <p className="text-[11px] text-gray-500">
                Aucun objectif courant pour cette période.
              </p>
            ) : (
              <div className="flex flex-col gap-3 text-[11px]">
                <p className="text-gray-600 font-medium">
                  Période : {currentGoal.periodLabel}
                </p>
                {(() => {
                  const realizedRevenue = Number(
                    currentGoal.realizedRevenue ?? 0,
                  );
                  const targetRevenue = Number(currentGoal.targetRevenue ?? 0);
                  return (
                    <>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Conversions</span>
                    <span className="font-semibold text-primary">
                      {currentGoal.realizedConversions} /{" "}
                      {currentGoal.targetConversions}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${
                          currentGoal.targetConversions > 0
                            ? Math.min(
                                100,
                                (currentGoal.realizedConversions /
                                  currentGoal.targetConversions) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">CA</span>
                    <span className="font-semibold text-primary">
                      {realizedRevenue.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "XOF",
                        maximumFractionDigits: 0,
                      })}{" "}
                      /{" "}
                      {targetRevenue.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "XOF",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${
                          targetRevenue > 0
                            ? Math.min(
                                100,
                                (realizedRevenue / targetRevenue) * 100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                    </>
                  );
                })()}
              </div>
            )}
          </NeumoCard>
        </section>

        {isManagerOrAdmin && (
          <section className="mt-2">
            <NeumoCard className="p-4 bg-white border border-gray-100 shadow-neu-soft flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-primary">
                  Vue d&apos;ensemble équipe
                </p>
                <Link
                  href="/stats"
                  className="text-[11px] text-primary hover:underline"
                >
                  Ouvrir les statistiques
                </Link>
              </div>
              <p className="text-[11px] text-gray-600">
                Accédez à la page Statistiques pour suivre les performances de
                l&apos;équipe, les objectifs par commercial et les rapports de
                ventes.
              </p>
            </NeumoCard>
          </section>
        )}
      </main>
    </div>
  );
}

