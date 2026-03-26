'use client';

import NeumoCard from '@/components/NeumoCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import TenderCreateSheet from '@/components/TenderCreateSheet';
import { withDashboardLayout } from '@/components/layouts/withDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type TenderStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'WON'
  | 'LOST'
  | 'CANCELLED';

type TenderRow = {
  id: string;
  title: string;
  reference?: string | null;
  status: TenderStatus;
  dueDate?: string | null;
  createdAt: string;
  apporteur?: { id: string; name: string } | null;
  assignments?: { userId: string; user: { id: string; name: string; role: string } }[];
};

const STATUS_LABELS: Record<TenderStatus, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  IN_PROGRESS: 'En cours',
  SUBMITTED: 'Soumis',
  WON: 'Gagné',
  LOST: 'Perdu',
  CANCELLED: 'Annulé',
};

const STATUS_STYLES: Record<TenderStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border border-slate-200',
  PUBLISHED: 'bg-blue-100 text-blue-700 border border-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border border-amber-200',
  SUBMITTED: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  WON: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  LOST: 'bg-rose-100 text-rose-700 border border-rose-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border border-gray-200',
};

function TendersPageInner() {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';
  const [createOpen, setCreateOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenderStatus>('ALL');
  const [loading, setLoading] = useState(true);
  const [tenders, setTenders] = useState<TenderRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (query.trim()) params.set('search', query.trim());
        const res = await fetch(`/api/tenders?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        const rows: TenderRow[] = Array.isArray(data)
          ? data.map((x: any) => ({
              id: String(x.id),
              title: String(x.title ?? ''),
              reference: x.reference ?? null,
              status: String(x.status ?? 'DRAFT') as TenderStatus,
              dueDate: x.dueDate ?? null,
              createdAt: String(x.createdAt ?? new Date().toISOString()),
              apporteur: x.apporteur ? { id: x.apporteur.id, name: x.apporteur.name } : null,
              assignments: Array.isArray(x.assignments) ? x.assignments : [],
            }))
          : [];
        setTenders(rows.filter((r) => r.id && r.title));
      } finally {
        setLoading(false);
      }
    })();
  }, [query, statusFilter]);

  return (
    <>
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-primary">Appels d’offre</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Suivez les AO et centralisez les activités commerciales.
          </p>
        </div>
        {isManagerOrAdmin && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-white text-xs font-medium shadow-neu"
          >
            <Plus className="w-3.5 h-3.5" /> Créer un AO
          </button>
        )}
      </section>

      <NeumoCard className="mt-4 p-4 bg-white flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100 text-xs w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre / référence"
              className="bg-transparent outline-none flex-1 text-[11px] text-gray-700"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-1 text-[11px] bg-gray-50 rounded-full p-1 border border-gray-100 w-fit">
            {(['ALL', 'DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'SUBMITTED', 'WON', 'LOST', 'CANCELLED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full transition-colors ${
                  statusFilter === s
                    ? 'bg-white text-primary shadow-neu'
                    : 'text-gray-500 hover:text-primary'
                }`}
                disabled={loading}
              >
                {s === 'ALL' ? 'Tous' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
          </div>
        ) : tenders.length === 0 ? (
          <div className="py-10 text-center text-[12px] text-gray-500">Aucun appel d’offre.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenders.map((t) => (
              <Link key={t.id} href={`/tenders/${t.id}`} className="block">
                <NeumoCard className="p-4 bg-white hover:brightness-[1.01] transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">{t.title}</p>
                      <p className="text-[11px] text-gray-500">
                        Référence : <span className="text-gray-700 font-medium">{t.reference ?? '—'}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Apporteur : <span className="text-gray-700 font-medium">{t.apporteur?.name ?? '—'}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Échéance : <span className="text-gray-700">{t.dueDate ? new Date(t.dueDate).toLocaleDateString('fr-FR') : '—'}</span>
                      </p>
                    </div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0 ${STATUS_STYLES[t.status]}`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span>
                      Créé le {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {t.assignments?.length ?? 0}
                    </span>
                  </div>
                </NeumoCard>
              </Link>
            ))}
          </div>
        )}
      </NeumoCard>

      {isManagerOrAdmin && (
        <TenderCreateSheet
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(id) => {
            setCreateOpen(false);
            window.location.href = `/tenders/${id}`;
          }}
        />
      )}
    </>
  );
}

const TendersPage = withDashboardLayout(TendersPageInner);
export default TendersPage;

