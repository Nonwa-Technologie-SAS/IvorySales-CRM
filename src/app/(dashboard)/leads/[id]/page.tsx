"use client";

import CreateEmailModal from "@/components/CreateEmailModal";
import EmailsTabContent from "@/components/EmailsTabContent";
import InteractionHistory, { type Activity } from "@/components/InteractionHistory";
import AgendaTab from "@/components/AgendaTab";
import type { Lead } from "@/components/LeadCard";
import LeadAttachmentsBlock from "@/components/lead-attachments/LeadAttachmentsBlock";
import LeadEditSheet from "@/components/LeadEditSheet";
import MeetingsTabContent from "@/components/MeetingsTabContent";
import Navbar from "@/components/Navbar";
import NeumoCard from "@/components/NeumoCard";
import Sidebar from "@/components/Sidebar";
import SkeletonLoader from "@/components/SkeletonLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nouveau lead",
  CONTACTED: "Contacté",
  QUALIFIED: "Qualifié",
  LOST: "Perdu",
  CONVERTED: "Converti",
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 border border-blue-200",
  CONTACTED: "bg-amber-100 text-amber-800 border border-amber-200",
  QUALIFIED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  LOST: "bg-rose-100 text-rose-700 border border-rose-200",
  CONVERTED: "bg-teal-100 text-teal-700 border border-teal-200",
};

const LIFECYCLE_STAGES = [
  { key: "NEW", label: "Nouveau" },
  { key: "CONTACTED", label: "Contacté" },
  { key: "QUALIFIED", label: "Qualifié" },
  { key: "LOST", label: "Perdu" },
  { key: "CONVERTED", label: "Converti" },
] as const;

const ACTIVITY_TABS = [
  { key: "activity", label: "Activité", filterType: undefined },
  { key: "agenda", label: "Agenda", filterType: undefined },
  { key: "notes", label: "Notes", filterType: "NOTE" },
  { key: "emails", label: "Emails", filterType: "EMAIL" },
  { key: "calls", label: "Appels", filterType: "CALL" },
  { key: "meetings", label: "Rendez-vous", filterType: "MEETING" },
];

interface LeadDetail {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  companyName?: string | null;
  location?: string | null;
  activityDomain?: string | null;
  notes?: string | null;
  civility?: string | null;
  status: string;
  companyId: string;
  company: { id: string; name: string };
  activities: Activity[];
  products?: { id: string; name: string }[];
  services?: { id: string; name: string }[];
  totalActivities?: number;
  hasMoreActivities?: boolean;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");
  const [editOpen, setEditOpen] = useState(false);
  const [createEmailOpen, setCreateEmailOpen] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const [convertMessage, setConvertMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [converting, setConverting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/leads/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setLead(data))
      .catch(() => setLead(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-bgGray">
        <Sidebar />
        <main className="flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full">
          <Navbar />
          <div className="flex-1 flex flex-col gap-4 mt-2">
            {/* Skeleton : bandeau Détails du lead + cycle de vie */}
            <NeumoCard className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <SkeletonLoader className="h-4 w-32" />
                  <SkeletonLoader className="h-4 w-40" />
                </div>
                <div className="flex w-full gap-1 rounded-xl overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonLoader key={i} className="flex-1 h-9" />
                  ))}
                </div>
              </div>
            </NeumoCard>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Colonne gauche - Profil */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <SkeletonLoader className="h-4 w-28" />
                <NeumoCard className="p-4 flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-3">
                    <SkeletonLoader className="w-20 h-20 rounded-full shrink-0" />
                    <div className="flex flex-col items-center gap-2 w-full">
                      <SkeletonLoader className="h-5 w-40" />
                      <SkeletonLoader className="h-3 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <SkeletonLoader key={i} className="w-9 h-9 rounded-full" />
                      ))}
                    </div>
                    <SkeletonLoader className="w-full h-9 rounded-xl" />
                    <SkeletonLoader className="h-3 w-36" />
                  </div>
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex gap-2">
                      <SkeletonLoader className="h-4 w-20" />
                      <SkeletonLoader className="h-4 w-16" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between gap-2">
                          <SkeletonLoader className="h-3 w-16" />
                          <SkeletonLoader className="h-3 flex-1 max-w-32" />
                        </div>
                      ))}
                    </div>
                  </div>
                </NeumoCard>
              </div>

              {/* Colonne centrale - Activités */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <NeumoCard className="p-4 flex flex-col gap-4 flex-1">
                  <SkeletonLoader className="h-9 w-full rounded-full" />
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <SkeletonLoader key={i} className="h-7 w-16 rounded-full" />
                    ))}
                  </div>
                  <div className="flex-1 min-h-[200px] space-y-3">
                    <SkeletonLoader className="h-4 w-full" />
                    <SkeletonLoader className="h-4 w-3/4" />
                    <SkeletonLoader className="h-4 w-1/2" />
                    <SkeletonLoader className="h-12 w-full rounded-xl" />
                    <SkeletonLoader className="h-12 w-full rounded-xl" />
                  </div>
                </NeumoCard>
              </div>

              {/* Colonne droite - Entreprise, Deals, Tickets */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <NeumoCard className="p-4 flex flex-col gap-3">
                  <SkeletonLoader className="h-4 w-24" />
                  <div className="flex items-center gap-2">
                    <SkeletonLoader className="w-10 h-10 rounded-lg" />
                    <div className="flex flex-col gap-2 flex-1">
                      <SkeletonLoader className="h-3 w-28" />
                      <SkeletonLoader className="h-3 w-36" />
                      <SkeletonLoader className="h-3 w-24" />
                    </div>
                  </div>
                </NeumoCard>
                <NeumoCard className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between">
                    <SkeletonLoader className="h-4 w-16" />
                    <SkeletonLoader className="h-3 w-6" />
                  </div>
                  <SkeletonLoader className="w-full h-9 rounded-xl" />
                </NeumoCard>
                <NeumoCard className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between">
                    <SkeletonLoader className="h-4 w-14" />
                    <SkeletonLoader className="h-3 w-6" />
                  </div>
                  <SkeletonLoader className="h-4 w-full" />
                </NeumoCard>
                <NeumoCard className="p-4 flex flex-col gap-3">
                  <SkeletonLoader className="h-4 w-28" />
                  <SkeletonLoader className="h-4 w-full" />
                </NeumoCard>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex bg-bgGray">
        <Sidebar />
        <main className="flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-gray-500">Lead introuvable.</p>
            <Link
              href="/leads"
              className="inline-flex items-center gap-2 text-primary text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Retour aux leads
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const leadAsLead: Lead = {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    source: lead.source,
    notes: lead.notes,
    companyName: lead.companyName ?? lead.company?.name,
    location: lead.location,
    activityDomain: lead.activityDomain,
    civility: lead.civility,
  };

  const initials = `${lead.firstName[0] || ""}${lead.lastName[0] || ""}`.toUpperCase();
  const lastActivity = lead.activities[0];

  const productNames =
    lead.products && lead.products.length
      ? lead.products.map((p) => p.name).join(", ")
      : "—";

  const serviceNames =
    lead.services && lead.services.length
      ? lead.services.map((s) => s.name).join(", ")
      : "—";

  const currentStageIndex = LIFECYCLE_STAGES.findIndex((s) => s.key === lead.status);
  const completedIndex = currentStageIndex >= 0 ? currentStageIndex : -1;

  const currentTabConfig = ACTIVITY_TABS.find((t) => t.key === activeTab);
  const currentFilterType = currentTabConfig?.filterType;

  const activitiesForCurrentFilter =
    currentFilterType && currentFilterType !== "ALL"
      ? lead.activities.filter((a) => a.type === currentFilterType)
      : lead.activities;

  const handleLoadMoreActivities = async () => {
    if (!lead) return;
    // Onglet Agenda : pagination gérée par un autre composant
    if (activeTab === "agenda") return;

    const tabConfig = ACTIVITY_TABS.find((t) => t.key === activeTab);
    const filterType = tabConfig?.filterType ?? "ALL";

    const alreadyLoadedCount =
      filterType && filterType !== "ALL"
        ? lead.activities.filter((a) => a.type === filterType).length
        : lead.activities.length;

    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        skip: String(alreadyLoadedCount),
        take: "20",
      });
      if (filterType && filterType !== "ALL") {
        params.set("filterType", filterType);
      }

      const res = await fetch(
        `/api/leads/${encodeURIComponent(lead.id)}/activities?${params.toString()}`
      );
      if (!res.ok) return;

      const payload: {
        activities: Activity[];
        total: number;
        hasMore: boolean;
      } = await res.json();

      setLead((prev) => {
        if (!prev) return prev;
        const existingIds = new Set(prev.activities.map((a) => a.id));
        const merged = [...prev.activities];
        for (const a of payload.activities) {
          if (!existingIds.has(a.id)) {
            merged.push(a);
          }
        }
        merged.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return {
          ...prev,
          activities: merged,
          totalActivities:
            typeof payload.total === "number"
              ? payload.total
              : prev.totalActivities,
          hasMoreActivities:
            typeof payload.hasMore === "boolean"
              ? payload.hasMore
              : prev.hasMoreActivities,
        };
      });
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bgGray">
      <Sidebar />
      <main className="flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full">
        <Navbar />
        {/* Section Détails du lead - Cycle de vie */}
        <NeumoCard className="p-4 mt-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-primary">Détails du lead</h2>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>Étape du cycle : {STATUS_LABELS[lead.status] ?? lead.status}</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex w-full rounded-xl overflow-hidden bg-gray-100">
                {LIFECYCLE_STAGES.map((stage, idx) => {
                  const isCompleted = idx <= completedIndex;
                  return (
                    <div
                      key={stage.key}
                      className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 px-2 text-[10px] font-medium border-r border-white/50 last:border-r-0 ${
                        isCompleted
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate">{stage.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </NeumoCard>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Colonne gauche - Profil & infos */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link
              href="/leads"
              className="inline-flex items-center gap-2 text-[11px] text-gray-500 hover:text-primary"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour aux leads
            </Link>

            <NeumoCard className="p-4 flex flex-col gap-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-semibold shadow-neu">
                  {initials}
                </div>
                <div className="text-center">
                  <h1 className="text-lg font-semibold text-primary">
                    {lead.firstName} {lead.lastName}
                  </h1>
                  <p className="text-[11px] text-gray-500">{lead.company?.name ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="px-4 py-2 rounded-full bg-primary text-white text-xs font-medium shadow-neu hover:brightness-105 transition"
                  >
                    Modifier
                  </button>
                </div>
                {lead.status === "CONVERTED" ? (
                  <div className="w-full py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium text-center border border-gray-200">
                    Déjà client
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={converting}
                    onClick={async () => {
                      setConvertMessage(null);
                      if (lead.status === "CONVERTED") {
                        setConvertMessage({
                          type: "error",
                          text: "Ce prospect est déjà enregistré comme client.",
                        });
                        setTimeout(() => setConvertMessage(null), 5000);
                        return;
                      }
                      setConverting(true);
                      try {
                        const res = await fetch("/api/clients", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ leadId: lead.id }),
                        });
                        const body = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          setConvertMessage({
                            type: "error",
                            text:
                              typeof body.error === "string"
                                ? body.error
                                : "Impossible de convertir ce prospect en client.",
                          });
                          setTimeout(() => setConvertMessage(null), 5000);
                          return;
                        }
                        setLead((prev) =>
                          prev
                            ? { ...prev, status: (body.lead?.status ?? "CONVERTED") as string }
                            : prev
                        );
                        setConvertMessage({
                          type: "success",
                          text: "Prospect converti en client avec succès.",
                        });
                        setTimeout(() => setConvertMessage(null), 5000);
                        // Rafraîchir les objectifs sur le dashboard (Mon objectif)
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("crm:goals-invalidate"));
                        }
                      } catch (e) {
                        setConvertMessage({
                          type: "error",
                          text: "Une erreur est survenue lors de la conversion.",
                        });
                        setTimeout(() => setConvertMessage(null), 5000);
                      } finally {
                        setConverting(false);
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-primary text-white text-xs font-medium shadow-neu hover:brightness-105 transition disabled:opacity-60"
                  >
                    {converting ? "Conversion..." : "Convertir en contact"}
                  </button>
                )}
                {convertMessage && (
                  <p
                    className={`text-[11px] px-3 py-2 rounded-xl ${
                      convertMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {convertMessage.text}
                  </p>
                )}
                {lastActivity && (
                  <p className="text-[10px] text-gray-400">
                    Dernière activité :{" "}
                    {new Date(lastActivity.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex gap-2 border-b border-gray-100">
                  <button
                    type="button"
                    className="pb-2 text-[11px] font-medium text-primary border-b-2 border-primary"
                  >
                    Infos lead
                  </button>
                  <button
                    type="button"
                    className="pb-2 text-[11px] font-medium text-gray-500"
                  >
                    Adresse
                  </button>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-700">{lead.email ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Téléphone</span>
                    <span className="text-gray-700">{lead.phone ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Domaine d&apos;activités</span>
                    <span className="text-gray-700">
                      {lead.activityDomain ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-500">Statut</span>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium ${
                        STATUS_STYLES[lead.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Localisation</span>
                    <span className="text-gray-700">
                      {lead.location ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Source</span>
                    <span className="text-gray-700">{lead.source ?? "—"}</span>
                  </div>
                  <div className="mt-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 px-3 py-2.5 space-y-1">
                    <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
                      Intérêt produits & services
                    </p>
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <div className="flex gap-2">
                        <span className="text-gray-500 whitespace-nowrap">
                          Produits :
                        </span>
                        <span className="text-indigo-900 font-medium">
                          {productNames}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500 whitespace-nowrap">
                          Services :
                        </span>
                        <span className="text-indigo-900 font-medium">
                          {serviceNames}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </NeumoCard>
          </div>

          {/* Colonne centrale - Activités */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <NeumoCard className="p-4 flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100 text-xs w-full">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Rechercher activités, notes, emails..."
                  className="bg-transparent outline-none flex-1 text-[11px] text-gray-700"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITY_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-primary text-white shadow-neu"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-[200px] overflow-y-auto">
                {activeTab === "agenda" ? (
                  <AgendaTab leadId={lead.id} />
                ) : activeTab === "emails" ? (
                  <EmailsTabContent
                    emails={lead.activities.filter((a) => a.type === "EMAIL")}
                    loading={false}
                    recipientName={`${lead.firstName} ${lead.lastName}`}
                    recipientEmail={lead.email ?? ""}
                    onCreateEmail={() => setCreateEmailOpen(true)}
                    onEmailAdded={(a) =>
                      setLead((prev) =>
                        prev ? { ...prev, activities: [a, ...prev.activities] } : prev
                      )
                    }
                  />
                ) : activeTab === "meetings" ? (
                  <MeetingsTabContent
                    meetings={lead.activities.filter((a) => a.type === "MEETING")}
                    loading={false}
                    leadId={lead.id}
                    leadName={`${lead.firstName} ${lead.lastName}`}
                    onCreateSuccess={(a) =>
                      setLead((prev) =>
                        prev ? { ...prev, activities: [a, ...prev.activities] } : prev
                      )
                    }
                  />
                ) : (
                  <InteractionHistory
                    lead={leadAsLead}
                    activities={lead.activities}
                    filterType={ACTIVITY_TABS.find((t) => t.key === activeTab)?.filterType}
                    title={activeTab === "calls" ? "Journal des appels" : undefined}
                    initialType={activeTab === "calls" ? "CALL" : undefined}
                    onActivityAdded={(a) =>
                      setLead((prev) =>
                        prev ? { ...prev, activities: [a, ...prev.activities] } : prev
                      )
                    }
                  />
                )}
              </div>
              {activeTab !== "agenda" && lead.hasMoreActivities && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMoreActivities}
                    disabled={loadingMore}
                    className="px-4 py-1.5 rounded-full text-[11px] bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 disabled:opacity-60"
                  >
                    {loadingMore ? "Chargement..." : "Charger plus"}
                  </button>
                </div>
              )}
            </NeumoCard>
          </div>

          {/* Colonne droite - Société + Deals */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <NeumoCard className="p-4 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-primary">Entreprise</h3>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary">
                    {lead.company?.name ?? "—"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {lead.email ?? "—"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {lead.phone ?? "—"}
                  </p>
                </div>
              </div>
            </NeumoCard>

            <NeumoCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-primary">Deals</h3>
                <span className="text-[10px] text-gray-400">0</span>
              </div>
              <button
                type="button"
                className="w-full py-2 rounded-xl border border-dashed border-gray-200 text-[11px] text-gray-500 hover:bg-gray-50"
              >
                + Créer un deal
              </button>
            </NeumoCard>

            <NeumoCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-primary">Tickets</h3>
                <span className="text-[10px] text-gray-400">0</span>
              </div>
              <p className="text-[11px] text-gray-500">Aucun ticket</p>
            </NeumoCard>

            <LeadAttachmentsBlock leadId={lead.id} />
          </div>
        </div>
      </main>

      <LeadEditSheet
        open={editOpen}
        lead={leadAsLead}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) =>
          setLead((prev) =>
            prev ? { ...prev, ...updated } : prev
          )
        }
      />

      <CreateEmailModal
        open={createEmailOpen}
        leadId={lead.id}
        recipientName={`${lead.firstName} ${lead.lastName}`}
        recipientEmail={lead.email ?? ""}
        onClose={() => setCreateEmailOpen(false)}
        onSent={(activity) =>
          setLead((prev) =>
            prev ? { ...prev, activities: [activity, ...prev.activities] } : prev
          )
        }
      />
    </div>
  );
}
