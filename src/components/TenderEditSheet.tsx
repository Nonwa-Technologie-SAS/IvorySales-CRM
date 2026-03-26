'use client';

import NeumoCard from '@/components/NeumoCard';
import { useEffect, useMemo, useState } from 'react';

type Candidate = { id: string; name: string; role: 'ADMIN' | 'MANAGER' | 'AGENT' };

type Props = {
  open: boolean;
  tender: {
    id: string;
    title: string;
    reference?: string | null;
    description?: string | null;
    dueDate?: string | null;
    budget?: number | null;
    apporteurId?: string | null;
    assignments?: { userId: string }[];
  } | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function TenderEditSheet({ open, tender, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [budget, setBudget] = useState('');
  const [apporteurId, setApporteurId] = useState('');
  const [assignees, setAssignees] = useState<Record<string, boolean>>({});
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !tender) return;
    setTitle(tender.title);
    setReference(tender.reference ?? '');
    setDescription(tender.description ?? '');
    setDueDate(tender.dueDate ? tender.dueDate.slice(0, 10) : '');
    setBudget(tender.budget != null ? String(tender.budget) : '');
    setApporteurId(tender.apporteurId ?? '');
    setAssignees(
      Object.fromEntries((tender.assignments ?? []).map((a) => [a.userId, true])),
    );
  }, [open, tender]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const res = await fetch('/api/tenders/assignees-candidates');
      const data = await res.json().catch(() => []);
      if (res.ok && Array.isArray(data)) setCandidates(data);
    })();
  }, [open]);

  const assigneeIds = useMemo(
    () => Object.entries(assignees).filter(([, v]) => v).map(([id]) => id),
    [assignees],
  );

  if (!open || !tender) return null;

  const submit = async () => {
    setError(null);
    if (!title.trim()) return setError('Le titre est requis.');
    try {
      setSaving(true);
      const res = await fetch(`/api/tenders/${encodeURIComponent(tender.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          reference,
          description,
          dueDate: dueDate || null,
          budget: budget ? Number(budget) : null,
          apporteurId: apporteurId || null,
          assigneeIds,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Erreur de mise à jour');
        return;
      }
      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <NeumoCard className="w-full max-w-2xl bg-white p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-primary">Modifier l’appel d’offre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50" />
          <input value={reference} onChange={(e) => setReference(e.target.value)} className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50" />
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50" />
          <select value={apporteurId} onChange={(e) => setApporteurId(e.target.value)} className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 md:col-span-2">
            <option value="">Apporteur</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
            ))}
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] rounded-xl border border-gray-200 px-3 py-2 text-[11px] bg-gray-50 md:col-span-2" />
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-700 mb-2">Commerciaux affectés</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {candidates.filter((c) => c.role === 'AGENT').map((c) => (
              <label key={c.id} className="flex items-center justify-between rounded-lg bg-white border border-gray-100 px-2.5 py-1.5 text-[11px]">
                <span>{c.name}</span>
                <input type="checkbox" checked={!!assignees[c.id]} onChange={() => setAssignees((p) => ({ ...p, [c.id]: !p[c.id] }))} />
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-[11px] text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-full text-[11px] bg-gray-100 border border-gray-200">Annuler</button>
          <button type="button" onClick={submit} disabled={saving} className="px-3 py-2 rounded-full text-[11px] bg-primary text-white disabled:opacity-60">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </NeumoCard>
    </div>
  );
}

