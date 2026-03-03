"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  List,
  LayoutGrid,
  Columns3,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import NeumoCard from "@/components/NeumoCard";
import SkeletonLoader from "@/components/SkeletonLoader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LeadCreateSheet from "@/components/LeadCreateSheet";
import LeadImportSheet from "@/components/LeadImportSheet";
import LeadCard, { type Lead } from "@/components/LeadCard";
import LeadEditSheet from "@/components/LeadEditSheet";
import PipelineColumn from "@/components/PipelineColumn";
import { withDashboardLayout } from "@/components/layouts/withDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

type Filters = {
  status: string[];
  source: string;
  assignedTo: string;
  createdFrom: string;
  createdTo: string;
  staleDays?: number;
};

type SavedView = {
  id: string;
  name: string;
  filters: Filters;
};

interface LeadRow {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  status: string;
  notes?: string;
  companyName?: string | null;
  location?: string | null;
  activityDomain?: string | null;
  civility?: string | null;
}

const STATUS_ORDER = ["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED"];

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

type ViewMode = "liste" | "kanban" | "grid";

const DEFAULT_FILTERS: Filters = {
  status: [],
  source: "",
  assignedTo: "",
  createdFrom: "",
  createdTo: "",
  staleDays: undefined,
};

function buildSystemViewFilters(id: string): Filters {
  const today = new Date();
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  if (id === "system-follow-up") {
    // Leads à relancer : actifs, sans activité récente (7 jours)
    return {
      ...DEFAULT_FILTERS,
      status: ["NEW", "CONTACTED", "QUALIFIED"],
      staleDays: 7,
    };
  }

  if (id === "system-new-week") {
    const from = new Date();
    from.setDate(from.getDate() - 7);
    return {
      ...DEFAULT_FILTERS,
      createdFrom: toISO(from),
      createdTo: toISO(today),
    };
  }

  return { ...DEFAULT_FILTERS };
}

function LeadsPageInner() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [importSheetOpen, setImportSheetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const LEADS_PER_PAGE = 25;
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [selectedViewId, setSelectedViewId] = useState<string>("system-all");
  const [showFilters, setShowFilters] = useState(false);
  const [userOptions, setUserOptions] = useState<{ id: string; name: string; role: string }[]>([]);

  const isManagerOrAdmin =
    authUser?.role === "admin" || authUser?.role === "manager";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("crm_leads_views");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedViews(parsed);
      }
    } catch {
      // silencieux
    }
  }, []);

  useEffect(() => {
    if (!isManagerOrAdmin) return;
    (async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) return;
        const data = await res.json();
        setUserOptions(
          data.map((u: any) => ({
            id: u.id,
            name: u.name,
            role: u.role,
          })),
        );
      } catch {
        // silencieux
      }
    })();
  }, [isManagerOrAdmin]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status.length) {
        params.set("status", filters.status.join(","));
      }
      if (filters.source.trim()) {
        params.set("source", filters.source.trim());
      }
      if (filters.assignedTo) {
        params.set("assignedTo", filters.assignedTo);
      }
      if (filters.createdFrom) {
        params.set("createdFrom", filters.createdFrom);
      }
      if (filters.createdTo) {
        params.set("createdTo", filters.createdTo);
      }
      if (filters.staleDays && filters.staleDays > 0) {
        params.set("staleDays", String(filters.staleDays));
      }

      const qs = params.toString();
      const res = await fetch(`/api/leads${qs ? `?${qs}` : ""}`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped: LeadRow[] = data.map((l: any) => ({
        id: l.id,
        firstName: l.firstName,
        lastName: l.lastName,
        email: l.email,
        phone: l.phone,
        source: l.source,
        companyName: l.companyName,
        location: l.location,
        activityDomain: l.activityDomain,
        civility: l.civility,
        notes: l.notes ?? undefined,
        status: l.status ?? "NEW",
      }));
      setLeads(mapped);
    } catch {
      // silencieux pour le MVP
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const filtered = useMemo(
    () =>
      leads.filter((lead) => {
        const text = `${lead.firstName} ${lead.lastName} ${lead.email ?? ""} ${lead.phone ?? ""}`.toLowerCase();
        return !query || text.includes(query.toLowerCase());
      }),
    [leads, query],
  );

  // Pagination : calcul des leads à afficher pour la page courante
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * LEADS_PER_PAGE;
    const endIndex = startIndex + LEADS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / LEADS_PER_PAGE);

  // Réinitialiser à la page 1 si la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const grouped = useMemo(() => {
    const map: Record<string, LeadRow[]> = {};
    for (const status of STATUS_ORDER) map[status] = [];
    for (const lead of filtered) {
      const key = STATUS_ORDER.includes(lead.status) ? lead.status : "NEW";
      map[key].push(lead);
    }
    return map;
  }, [filtered]);

  const handleLeadDrop = async (
    leadId: string,
    newStatus: string,
    fromStatus?: string,
  ) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur");
    } catch {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, status: fromStatus ?? l.status } : l,
        ),
      );
    }
  };

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditOpen(true);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch("/api/leads/export");
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.error("Export leads échoué");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `leads-${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erreur lors de l'export des leads", error);
    } finally {
      setExporting(false);
    }
  };

  const handleSelectView = (id: string) => {
    setSelectedViewId(id);
    if (id.startsWith("system-")) {
      setFilters(buildSystemViewFilters(id));
    } else {
      const view = savedViews.find((v) => v.id === id);
      if (view) {
        setFilters(view.filters);
      }
    }
  };

  const handleSaveCurrentView = () => {
    if (typeof window === "undefined") return;
    const name = window.prompt("Nom de la vue");
    if (!name) return;
    const newView: SavedView = {
      id: `custom-${Date.now()}`,
      name,
      filters,
    };
    const updated = [...savedViews, newView];
    setSavedViews(updated);
    setSelectedViewId(newView.id);
    try {
      window.localStorage.setItem("crm_leads_views", JSON.stringify(updated));
    } catch {
      // silencieux
    }
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedViewId("");
    setFilters((prev) => {
      const exists = prev.status.includes(status);
      return {
        ...prev,
        status: exists
          ? prev.status.filter((s) => s !== status)
          : [...prev.status, status],
      };
    });
  };

  return (
    <>
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-primary">Leads</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Suivez vos prospects à travers le pipeline commercial.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-white shadow-neu p-0.5">
            {(["liste", "kanban", "grid"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-full text-xs transition-colors ${
                  viewMode === mode ? "bg-primary text-white shadow-neu" : "text-gray-500 hover:bg-gray-50"
                }`}
                title={mode === "liste" ? "Liste" : mode === "kanban" ? "Kanban" : "Grille"}
              >
                {mode === "liste" && <List className="w-4 h-4" />}
                {mode === "kanban" && <Columns3 className="w-4 h-4" />}
                {mode === "grid" && <LayoutGrid className="w-4 h-4" />}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-white text-xs font-medium shadow-neu"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter un lead
          </button>
          <button
            type="button"
            onClick={() => setImportSheetOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-medium shadow-neu hover:bg-gray-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Importer Excel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-medium shadow-neu hover:bg-gray-50 disabled:opacity-60"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {exporting ? "Export..." : "Exporter les leads"}
          </button>
        </div>
      </section>

      <NeumoCard className="mt-4 p-4 bg-white flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100 text-xs w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, email ou téléphone"
              className="bg-transparent outline-none flex-1 text-[11px] text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px] justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Vues</span>
              <select
                value={selectedViewId}
                onChange={(e) => handleSelectView(e.target.value)}
                className="h-8 rounded-full border border-gray-200 bg-white px-2.5 text-[11px] text-gray-700"
              >
                <option value="system-all">Tous les leads</option>
                <option value="system-follow-up">Leads à relancer</option>
                <option value="system-new-week">Nouveaux leads (7 derniers jours)</option>
                {savedViews.map((view) => (
                  <option key={view.id} value={view.id}>
                    {view.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleSaveCurrentView}
              className="px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] text-gray-700 hover:bg-gray-50"
            >
              Enregistrer la vue
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="md:hidden px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] text-gray-700"
            >
              {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            </button>
          </div>
        </div>

        <div
          className={`mt-2 rounded-2xl bg-gray-50 border border-gray-100 px-3 py-3 flex flex-col gap-3 ${
            showFilters ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex flex-wrap gap-1.5">
            {STATUS_ORDER.map((status) => {
              const active = filters.status.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatusFilter(status)}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] border transition-colors ${
                    active
                      ? "bg-primary text-white border-primary shadow-neu"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {STATUS_LABELS[status] ?? status}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Source</span>
              <input
                type="text"
                value={filters.source}
                onChange={(e) => {
                  setSelectedViewId("");
                  setFilters((prev) => ({ ...prev, source: e.target.value }));
                }}
                placeholder="Ex: Facebook, WhatsApp..."
                className="h-8 rounded-full border border-gray-200 bg-white px-3 text-[11px] text-gray-700"
              />
            </div>
            {isManagerOrAdmin && (
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Commercial</span>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => {
                    setSelectedViewId("");
                    setFilters((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                    }));
                  }}
                  className="h-8 rounded-full border border-gray-200 bg-white px-3 text-[11px] text-gray-700"
                >
                  <option value="">Tous</option>
                  {userOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Date de création</span>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={filters.createdFrom}
                  onChange={(e) => {
                    setSelectedViewId("");
                    setFilters((prev) => ({
                      ...prev,
                      createdFrom: e.target.value,
                    }));
                  }}
                  className="h-8 rounded-full border border-gray-200 bg-white px-2 text-[11px] text-gray-700 flex-1"
                />
                <span className="text-gray-400 text-[10px]">au</span>
                <input
                  type="date"
                  value={filters.createdTo}
                  onChange={(e) => {
                    setSelectedViewId("");
                    setFilters((prev) => ({
                      ...prev,
                      createdTo: e.target.value,
                    }));
                  }}
                  className="h-8 rounded-full border border-gray-200 bg-white px-2 text-[11px] text-gray-700 flex-1"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Dernière activité &gt; X jours</span>
              <input
                type="number"
                min={0}
                value={filters.staleDays ?? ""}
                onChange={(e) => {
                  setSelectedViewId("");
                  const val = e.target.value;
                  const num = val ? Number.parseInt(val, 10) : NaN;
                  setFilters((prev) => ({
                    ...prev,
                    staleDays: Number.isNaN(num) ? undefined : num,
                  }));
                }}
                placeholder="Ex: 7"
                className="h-8 rounded-full border border-gray-200 bg-white px-3 text-[11px] text-gray-700"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 flex flex-col gap-4">
            <SkeletonLoader className="h-20" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonLoader className="h-32" />
              <SkeletonLoader className="h-32" />
              <SkeletonLoader className="h-32" />
            </div>
          </div>
        ) : (
          <>
        {viewMode === "liste" && (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto mt-2">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-[12px] text-gray-500">
                  Aucun lead pour le moment. Ajoutez votre premier prospect.
                </p>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="text-[11px] font-medium text-gray-500">Nom</TableHead>
                    <TableHead className="text-[11px] font-medium text-gray-500">Entreprise</TableHead>
                    <TableHead className="text-[11px] font-medium text-gray-500">Domaine</TableHead>
                    <TableHead className="text-[11px] font-medium text-gray-500">Localisation</TableHead>
                    <TableHead className="text-[11px] font-medium text-gray-500">Email</TableHead>
                    <TableHead className="text-[11px] font-medium text-gray-500">Téléphone</TableHead>
                    <TableHead className="text-[11px] font-medium text-gray-500">Statut</TableHead>
                    <TableHead className="text-[11px] font-medium text-gray-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="border-b border-gray-50 hover:bg-gray-50/60"
                  >
                    <TableCell className="py-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-primary">
                          {lead.firstName} {lead.lastName}
                        </span>
                        {lead.civility && (
                          <span className="text-[10px] text-gray-400">
                            {lead.civility}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-[11px] text-gray-600">
                      {lead.companyName ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-[11px] text-gray-600">
                      {lead.activityDomain ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-[11px] text-gray-600">
                      {lead.location ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-[11px] text-gray-600">
                      {lead.email ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-[11px] text-gray-600">
                      {lead.phone ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium ${
                          STATUS_STYLES[lead.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 text-gray-500 hover:text-primary border border-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              router.push(`/leads/${lead.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              openLead(lead as unknown as Lead);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600"
                            onSelect={async (e) => {
                              e.preventDefault();
                              if (!confirm("Supprimer ce lead ?")) return;
                              try {
                                const res = await fetch(`/api/leads?id=${lead.id}`, {
                                  method: "DELETE",
                                });
                                if (res.ok) {
                                  setLeads((prev) => prev.filter((l) => l.id !== lead.id));
                                }
                              } catch {
                                // silencieux
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </div>

            {/* Pagination */}
            {filtered.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
                <div className="text-[11px] text-gray-500">
                  Affichage de {(currentPage - 1) * LEADS_PER_PAGE + 1} à{" "}
                  {Math.min(currentPage * LEADS_PER_PAGE, filtered.length)} sur {filtered.length} prospects
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-primary text-white shadow-neu"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Page suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead as unknown as Lead}
                onClick={() => router.push(`/leads/${lead.id}`)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-[12px] text-gray-500 col-span-full py-4">
                Aucun lead pour le moment. Ajoutez votre premier prospect.
              </p>
            )}
          </div>
        )}

        {viewMode === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {STATUS_ORDER.map((status) => (
              <PipelineColumn
                key={status}
                title={STATUS_LABELS[status] ?? status}
                status={status}
                leads={(grouped[status] ?? []) as unknown as Lead[]}
                onDrop={handleLeadDrop}
                onLeadClick={(l) => router.push(`/leads/${l.id}`)}
              />
            ))}
          </div>
        )}
        </> )}
      </NeumoCard>

      <LeadCreateSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={(lead) =>
          setLeads((prev) => [
            {
              id: lead.id,
              firstName: lead.firstName,
              lastName: lead.lastName,
              email: lead.email,
              phone: lead.phone,
              source: lead.source,
              companyName: lead.companyName,
              location: lead.location,
              notes: lead.notes ?? undefined,
              status: lead.status ?? "NEW",
            },
            ...prev,
          ])
        }
      />

      <LeadImportSheet
        open={importSheetOpen}
        onClose={() => setImportSheetOpen(false)}
        onImported={() => fetchLeads()}
      />

      <LeadEditSheet
        open={editOpen}
        lead={selectedLead}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => {
          setLeads((prev) =>
            prev.map((l) =>
              l.id === updated.id
                ? {
                    ...l,
                    ...updated,
                    notes: updated.notes ?? undefined,
                  }
                : l,
            ),
          );
        }}
        onDeleted={(id) => {
          setLeads((prev) => prev.filter((l) => l.id !== id));
        }}
      />
    </>
  );
}

const LeadsPage = withDashboardLayout(LeadsPageInner);

export default LeadsPage;
