"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, List, LayoutGrid, Columns3, MoreHorizontal, Eye, Pencil, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
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

function LeadsPageInner() {
  const router = useRouter();
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

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
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
  };

  useEffect(() => {
    fetchLeads();
  }, []);

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
