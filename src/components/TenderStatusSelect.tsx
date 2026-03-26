'use client';

import { useState } from 'react';

const STATUS_OPTIONS = [
  'DRAFT',
  'PUBLISHED',
  'IN_PROGRESS',
  'SUBMITTED',
  'WON',
  'LOST',
  'CANCELLED',
] as const;

type TenderStatus = (typeof STATUS_OPTIONS)[number];

type Props = {
  tenderId: string;
  value: TenderStatus;
  disabled?: boolean;
  onUpdated?: (status: TenderStatus) => void;
};

export default function TenderStatusSelect({
  tenderId,
  value,
  disabled,
  onUpdated,
}: Props) {
  const [status, setStatus] = useState<TenderStatus>(value);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch(`/api/tenders/${encodeURIComponent(tenderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof body.error === 'string' ? body.error : 'Erreur de mise à jour');
        return;
      }
      onUpdated?.(status);
      setMessage('Statut mis à jour.');
      setTimeout(() => setMessage(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TenderStatus)}
          disabled={disabled || saving}
          className="h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || saving || status === value}
          className="px-3 py-2 rounded-full bg-primary text-white text-[11px] font-medium shadow-neu disabled:opacity-60"
        >
          {saving ? 'Mise à jour…' : 'Mettre à jour'}
        </button>
      </div>
      {message && <p className="text-[10px] text-gray-500">{message}</p>}
    </div>
  );
}

