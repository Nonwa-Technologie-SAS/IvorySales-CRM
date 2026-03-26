/* eslint-disable react/no-unstable-nested-components */
'use client';

import NeumoCard from '@/components/NeumoCard';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export type InterestKind = 'product' | 'service';

export type InterestItemLite = { id: string; name: string };

export type InterestsPayloadItem = {
  kind: InterestKind;
  id: string;
  estimatedValue: number;
};

type SavedInterests = {
  products: Record<string, number>;
  services: Record<string, number>;
};

type Props = {
  products: InterestItemLite[];
  services: InterestItemLite[];
  initialSaved: SavedInterests;
  disabled?: boolean;
  onSave: (items: InterestsPayloadItem[]) => Promise<
    | { ok: true; message?: string; counts?: { products: number; services: number } }
    | { ok: false; error: string }
  >;
  onAfterSave?: (saved: SavedInterests) => void;
};

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

function formatMoneyMaybe(value: number) {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function LeadInterestsEstimatorCard({
  products,
  services,
  initialSaved,
  disabled,
  onSave,
  onAfterSave,
}: Props) {
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<
    | { type: 'success' | 'error' | 'warn'; text: string }
    | null
  >(null);

  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(Object.keys(initialSaved.products).map((id) => [id, true])));
  const [selectedServices, setSelectedServices] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(Object.keys(initialSaved.services).map((id) => [id, true])));

  const [values, setValues] = useState<Record<string, number>>(() => ({
    ...initialSaved.products,
    ...initialSaved.services,
  }));

  const savedFingerprint = useMemo(() => {
    const p = Object.entries(initialSaved.products)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, v]) => `${id}:${v}`)
      .join('|');
    const s = Object.entries(initialSaved.services)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, v]) => `${id}:${v}`)
      .join('|');
    return `p=${p};s=${s}`;
  }, [initialSaved.products, initialSaved.services]);

  const currentItems = useMemo(() => {
    const items: InterestsPayloadItem[] = [];
    for (const [id, isSelected] of Object.entries(selectedProducts)) {
      if (!isSelected) continue;
      items.push({ kind: 'product', id, estimatedValue: values[id] ?? 0 });
    }
    for (const [id, isSelected] of Object.entries(selectedServices)) {
      if (!isSelected) continue;
      items.push({ kind: 'service', id, estimatedValue: values[id] ?? 0 });
    }
    return items;
  }, [selectedProducts, selectedServices, values]);

  const currentFingerprint = useMemo(() => {
    const p = currentItems
      .filter((i) => i.kind === 'product')
      .map((i) => [i.id, i.estimatedValue] as const)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, v]) => `${id}:${v}`)
      .join('|');
    const s = currentItems
      .filter((i) => i.kind === 'service')
      .map((i) => [i.id, i.estimatedValue] as const)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, v]) => `${id}:${v}`)
      .join('|');
    return `p=${p};s=${s}`;
  }, [currentItems]);

  const dirty = currentFingerprint !== savedFingerprint;

  const totalEstimated = useMemo(
    () => currentItems.reduce((acc, i) => acc + (i.estimatedValue || 0), 0),
    [currentItems],
  );

  const selectedCount = currentItems.length;

  const normalized = normalizeQuery(query);
  const filteredProducts = useMemo(() => {
    if (!normalized) return products;
    return products.filter((p) => p.name.toLowerCase().includes(normalized));
  }, [normalized, products]);

  const filteredServices = useMemo(() => {
    if (!normalized) return services;
    return services.filter((s) => s.name.toLowerCase().includes(normalized));
  }, [normalized, services]);

  const canSearch =
    (products?.length ?? 0) + (services?.length ?? 0) > 12;

  const validate = () => {
    for (const item of currentItems) {
      const v = item.estimatedValue;
      if (Number.isNaN(v) || typeof v !== 'number') {
        return 'Le montant estimé doit être un nombre.';
      }
      if (v < 0) {
        return 'Le montant estimé doit être ≥ 0.';
      }
    }
    return null;
  };

  const handleSave = async () => {
    setMessage(null);
    const error = validate();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }
    setSaving(true);
    try {
      const res = await onSave(currentItems);
      if (!res.ok) {
        setMessage({ type: 'error', text: res.error });
        return;
      }

      const saved: SavedInterests = {
        products: Object.fromEntries(
          currentItems
            .filter((i) => i.kind === 'product')
            .map((i) => [i.id, i.estimatedValue]),
        ),
        services: Object.fromEntries(
          currentItems
            .filter((i) => i.kind === 'service')
            .map((i) => [i.id, i.estimatedValue]),
        ),
      };

      onAfterSave?.(saved);
      setMessage({
        type: 'success',
        text: res.message ?? 'Intérêts enregistrés.',
      });
      setTimeout(() => setMessage(null), 4500);
    } finally {
      setSaving(false);
    }
  };

  const Row = ({
    kind,
    item,
    selected,
  }: {
    kind: InterestKind;
    item: InterestItemLite;
    selected: boolean;
  }) => {
    const checkboxId = `lead-interest-${kind}-${item.id}`;
    const inputId = `lead-interest-${kind}-${item.id}-value`;
    const value = values[item.id] ?? 0;

    const toggle = () => {
      if (disabled) return;
      setMessage(null);
      if (kind === 'product') {
        setSelectedProducts((prev) => ({ ...prev, [item.id]: !selected }));
      } else {
        setSelectedServices((prev) => ({ ...prev, [item.id]: !selected }));
      }
      if (!selected && values[item.id] === undefined) {
        setValues((prev) => ({ ...prev, [item.id]: 0 }));
      }
    };

    return (
      <div className="flex items-center justify-between gap-2 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <input
            id={checkboxId}
            type="checkbox"
            checked={selected}
            onChange={toggle}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 accent-primary"
          />
          <label
            htmlFor={checkboxId}
            className="text-[11px] text-gray-700 truncate cursor-pointer select-none"
            title={item.name}
          >
            {item.name}
          </label>
        </div>

        {selected && (
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor={inputId} className="sr-only">
              Montant estimé
            </label>
            <input
              id={inputId}
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={Number.isFinite(value) ? String(value) : ''}
              onChange={(e) => {
                setMessage(null);
                const next = e.target.value === '' ? 0 : Number(e.target.value);
                if (Number.isNaN(next)) return;
                setValues((prev) => ({ ...prev, [item.id]: next }));
              }}
              disabled={disabled}
              className="h-8 w-28 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <span className="text-[11px] text-gray-500">MAD</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <NeumoCard className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-primary">
          Intérêts & estimation
        </h3>
        <div className="text-[10px] text-gray-500">
          <span className="font-medium text-gray-700">{selectedCount}</span>{' '}
          sélectionné{selectedCount > 1 ? 's' : ''} ·{' '}
          <span className="font-medium text-gray-700">
            {formatMoneyMaybe(totalEstimated)}
          </span>{' '}
          MAD
        </div>
      </div>

      {canSearch && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100 text-xs w-full">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher produit / service"
            className="bg-transparent outline-none flex-1 text-[11px] text-gray-700"
            disabled={disabled}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl bg-white/60 border border-white/60 p-3 shadow-neu-soft">
          <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Produits
          </p>
          {filteredProducts.length === 0 ? (
            <p className="text-[11px] text-gray-500">Aucun produit.</p>
          ) : (
            <div className="flex flex-col">
              {filteredProducts.map((p) => (
                <Row
                  key={p.id}
                  kind="product"
                  item={p}
                  selected={!!selectedProducts[p.id]}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white/60 border border-white/60 p-3 shadow-neu-soft">
          <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Services
          </p>
          {filteredServices.length === 0 ? (
            <p className="text-[11px] text-gray-500">Aucun service.</p>
          ) : (
            <div className="flex flex-col">
              {filteredServices.map((s) => (
                <Row
                  key={s.id}
                  kind="service"
                  item={s}
                  selected={!!selectedServices[s.id]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="min-w-0">
          {!dirty ? (
            <p className="text-[10px] text-gray-400">À jour</p>
          ) : (
            <p className="text-[10px] text-gray-500">
              Modifications non enregistrées
            </p>
          )}
          {message && (
            <p
              role={message.type === 'error' ? 'alert' : 'status'}
              className={`text-[11px] mt-1 px-3 py-2 rounded-xl ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : message.type === 'warn'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || saving || !dirty}
          className="shrink-0 px-4 py-2 rounded-full bg-primary text-white text-xs font-medium shadow-neu hover:brightness-105 transition disabled:opacity-60"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </NeumoCard>
  );
}

