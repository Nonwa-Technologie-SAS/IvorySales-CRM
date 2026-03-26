'use client';

import Navbar from '@/components/Navbar';
import NeumoCard from '@/components/NeumoCard';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import TenderActivitiesPanel from '@/components/TenderActivitiesPanel';
import TenderAttachmentsBlock from '@/components/TenderAttachmentsBlock';
import TenderEditSheet from '@/components/TenderEditSheet';
import TenderStatusSelect from '@/components/TenderStatusSelect';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type TenderStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'WON'
  | 'LOST'
  | 'CANCELLED';

type TenderDetail = {
  id: string;
  title: string;
  reference?: string | null;
  description?: string | null;
  status: TenderStatus;
  dueDate?: string | null;
  budget?: number | null;
  createdAt: string;
  company: { id: string; name: string };
  createdBy: { id: string; name: string; role: string };
  apporteur?: { id: string; name: string; role: string } | null;
  assignments: { userId: string; user: { id: string; name: string; role: string } }[];
};

export default function TenderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [tender, setTender] = useState<TenderDetail | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('AGENT');

  const isManagerOrAdmin =
    currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER';

  const load = async () => {
    const [meRes, tenderRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch(`/api/tenders/${encodeURIComponent(id)}`),
    ]);
    if (meRes.ok) {
      const me = await meRes.json();
      setCurrentUserId(String(me.id ?? ''));
      setCurrentUserRole(String(me.role ?? 'AGENT'));
    }
    if (!tenderRes.ok) {
      setTender(null);
      return;
    }
    const data = await tenderRes.json();
    setTender(data);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    load()
      .catch(() => setTender(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const assigneeNames = useMemo(
    () => (tender?.assignments ?? []).map((a) => a.user.name).join(', ') || '—',
    [tender?.assignments],
  );

  const canWriteActivities =
    isManagerOrAdmin ||
    !!tender?.assignments.some((a) => a.userId === currentUserId);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-bgGray">
        <Sidebar />
        <main className="flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full">
          <Navbar />
          <NeumoCard className="p-4 mt-2"><SkeletonLoader className="h-40 w-full" /></NeumoCard>
        </main>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen flex bg-bgGray">
        <Sidebar />
        <main className="flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-gray-500">Appel d’offre introuvable.</p>
            <Link href="/tenders" className="inline-flex items-center gap-2 text-primary text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Retour aux AO
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bgGray">
      <Sidebar />
      <main className="flex-1 flex flex-col max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 gap-4 w-full">
        <Navbar />
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link href="/tenders" className="inline-flex items-center gap-2 text-[11px] text-gray-500 hover:text-primary">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour aux AO
            </Link>
            <NeumoCard className="p-4 flex flex-col gap-3">
              <h1 className="text-lg font-semibold text-primary">{tender.title}</h1>
              <p className="text-[11px] text-gray-600">Référence: {tender.reference ?? '—'}</p>
              <p className="text-[11px] text-gray-600">Entreprise: {tender.company.name}</p>
              <p className="text-[11px] text-gray-600">Apporteur: {tender.apporteur?.name ?? '—'}</p>
              <p className="text-[11px] text-gray-600">Budget: {tender.budget != null ? tender.budget.toLocaleString('fr-FR') : '—'}</p>
              <p className="text-[11px] text-gray-600">Échéance: {tender.dueDate ? new Date(tender.dueDate).toLocaleDateString('fr-FR') : '—'}</p>
              {tender.description && (
                <p className="text-[11px] text-gray-700 rounded-xl bg-gray-50 border border-gray-100 p-2.5">
                  {tender.description}
                </p>
              )}
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2">
                <p className="text-[10px] font-semibold text-indigo-700 uppercase">Commerciaux associés</p>
                <p className="text-[11px] text-indigo-900 mt-1 inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {assigneeNames}
                </p>
              </div>
              {isManagerOrAdmin && (
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="mt-1 px-3 py-2 rounded-full bg-primary text-white text-xs font-medium shadow-neu"
                >
                  Modifier
                </button>
              )}
            </NeumoCard>
            <NeumoCard className="p-4">
              <h3 className="text-xs font-semibold text-primary mb-2">Statut</h3>
              <TenderStatusSelect
                tenderId={tender.id}
                value={tender.status}
                disabled={!isManagerOrAdmin}
                onUpdated={(status) => setTender((p) => (p ? { ...p, status } : p))}
              />
            </NeumoCard>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            <NeumoCard className="p-4">
              <TenderActivitiesPanel
                tenderId={tender.id}
                canWrite={canWriteActivities}
              />
            </NeumoCard>
            <TenderAttachmentsBlock
              tenderId={tender.id}
              currentUserId={currentUserId}
              isManagerOrAdmin={isManagerOrAdmin}
            />
          </div>
        </div>
      </main>

      <TenderEditSheet
        open={editOpen}
        tender={{
          id: tender.id,
          title: tender.title,
          reference: tender.reference,
          description: tender.description,
          dueDate: tender.dueDate,
          budget: tender.budget,
          apporteurId: tender.apporteur?.id ?? null,
          assignments: tender.assignments.map((a) => ({ userId: a.userId })),
        }}
        onClose={() => setEditOpen(false)}
        onUpdated={() => {
          void load();
        }}
      />
    </div>
  );
}

