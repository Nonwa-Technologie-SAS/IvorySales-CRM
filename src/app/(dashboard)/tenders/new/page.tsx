'use client';

import NeumoCard from '@/components/NeumoCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import { withDashboardLayout } from '@/components/layouts/withDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type UserOption = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type TenderStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

function TenderNewPageInner() {
  const router = useRouter();
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const [usersLoading, setUsersLoading] = useState(true);
  const [users, setUsers] = useState<UserOption[]>([]);

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TenderStatus>('OPEN');
  const [dueDate, setDueDate] = useState('');
  const [sourceById, setSourceById] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<Record<string, boolean>>({});

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<
    { type: 'success' | 'error'; text: string } | null
  >(null);

  useEffect(() => {
    if (!isManagerOrAdmin) return;
    (async () => {
      try {
        setUsersLoading(true);
        const res = await fetch('/api/users');
        if (!res.ok) return;
        const data = await res.json();
        const mapped: UserOption[] = Array.isArray(data)
          ? data
              .map((u: any) => ({
                id: String(u.id),
                name: String(u.name ?? ''),
                email: String(u.email ?? ''),
                role: String(u.role ?? ''),
              }))
              .filter((u) => u.id && u.name)
          : [];
        setUsers(mapped);
        if (!sourceById && mapped.length > 0) {
          setSourceById(mapped[0].id);
        }
      } finally {
        setUsersLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManagerOrAdmin]);

  const selectedAssigneeIds = useMemo(
    () => Object.entries(assigneeIds).filter(([, v]) => v).map(([id]) => id),
    [assigneeIds],
  );

  if (!isManagerOrAdmin) {
    return (
      <NeumoCard className="mt-4 p-4 bg-white">
        <p className="text-[12px] text-gray-600">
          Accès réservé aux managers et admins.
        </p>
      </NeumoCard>
    );
  }

  const handleCreate = async () => {
    setMessage(null);
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Le titre est requis.' });
      return;
    }
    if (!sourceById) {
      setMessage({ type: 'error', text: "Choisissez un apporteur (source)." });
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          companyName: companyName.trim() || undefined,
          description: description.trim() || undefined,
          status,
          dueDate: dueDate || undefined,
          sourceById,
          assigneeIds: selectedAssigneeIds,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          type: 'error',
          text:
            typeof body.error === 'string'
              ? body.error
              : "Impossible de créer l'appel d'offre.",
        });
        return;
      }
      setMessage({ type: 'success', text: "Appel d'offre créé." });
      router.push(`/tenders/${body.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="flex items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-3">
          <Link
            href="/tenders"
            className="inline-flex items-center gap-2 text-[11px] text-gray-500 hover:text-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-primary">
              Nouvel appel d’offre
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Créez un AO, choisissez l’apporteur et assignez des commerciaux.
            </p>
          </div>
        </div>
      </section>

      <NeumoCard className="mt-4 p-5 bg-white shadow-neu-soft flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-xs text-gray-700">
            <span className="text-[11px] text-gray-600">Titre</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Ex: AO équipement réseau — Ministère X"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-700">
            <span className="text-[11px] text-gray-600">Statut</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TenderStatus)}
              className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="OPEN">Ouvert</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="CLOSED">Clôturé</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-700">
            <span className="text-[11px] text-gray-600">
              Nom de l&apos;entreprise (optionnel)
            </span>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Ex: Société ABC"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-700 md:col-span-2">
            <span className="text-[11px] text-gray-600">Description (optionnel)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] rounded-xl border border-gray-200 px-3 py-2 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
              placeholder="Contexte, exigences, liens, etc."
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-700">
            <span className="text-[11px] text-gray-600">Échéance (optionnel)</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-700">
            <span className="text-[11px] text-gray-600">Apporteur</span>
            {usersLoading ? (
              <SkeletonLoader className="h-9" />
            ) : (
              <select
                value={sourceById}
                onChange={(e) => setSourceById(e.target.value)}
                className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-primary">
                Commerciaux assignés
              </h2>
            </div>
            <span className="text-[11px] text-gray-500">
              {selectedAssigneeIds.length} sélectionné(s)
            </span>
          </div>
          {usersLoading ? (
            <div className="mt-3 space-y-2">
              <SkeletonLoader className="h-8" />
              <SkeletonLoader className="h-8" />
              <SkeletonLoader className="h-8" />
            </div>
          ) : users.length === 0 ? (
            <p className="mt-3 text-[11px] text-gray-500">
              Aucun utilisateur disponible.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map((u) => {
                const checked = !!assigneeIds[u.id];
                return (
                  <label
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-white border border-gray-100 px-3 py-2 text-[11px] text-gray-700"
                  >
                    <span className="truncate">
                      <span className="font-medium">{u.name}</span>{' '}
                      <span className="text-gray-400">({u.role})</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setAssigneeIds((prev) => ({
                          ...prev,
                          [u.id]: !checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 accent-primary"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {message && (
          <p
            className={`text-[11px] px-3 py-2 rounded-xl ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-medium shadow-neu disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Création…' : 'Créer'}
          </button>
        </div>
      </NeumoCard>
    </>
  );
}

const TenderNewPage = withDashboardLayout(TenderNewPageInner);
export default TenderNewPage;

