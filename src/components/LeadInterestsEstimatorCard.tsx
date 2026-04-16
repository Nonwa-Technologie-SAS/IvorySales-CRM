'use client';

import NeumoCard from '@/components/NeumoCard';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export type InterestKind = 'product' | 'service';

export type InterestItemLite = { id: string; name: string };

export type InterestsPayloadItem =
  | {
      kind: InterestKind;
      id: string;
      estimatedValue: number;
      customName?: never;
    }
  | {
      kind: InterestKind;
      customName: string;
      estimatedValue: number;
      id?: never;
    };

type SavedInterests = {
  products: Record<string, number>;
  services: Record<string, number>;
};

type PartnerCompanyCatalog = {
  id: string;
  name: string;
  products: InterestItemLite[];
  services: InterestItemLite[];
};

type Props = {
  products: InterestItemLite[];
  services: InterestItemLite[];
  partnerCompanies?: PartnerCompanyCatalog[];
  customProducts?: string[];
  customServices?: string[];
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

function normalizeCustomName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr-FR');
}

function makeCustomKey(kind: InterestKind, customName: string) {
  return `custom:${kind}:${normalizeCustomName(customName)}`;
}

function formatMoneyMaybe(value: number) {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

type InterestEstimatorRowProps = {
  kind: InterestKind;
  item: InterestItemLite;
  selected: boolean;
  disabled?: boolean;
  value: number;
  onToggle: () => void;
  onValueChange: (id: string, next: number) => void;
  onClearMessage: () => void;
};

/** Composant de ligne stable (hors du parent) pour éviter le remontage à chaque frappe → perte de focus. */
function InterestEstimatorRow({
  kind,
  item,
  selected,
  disabled,
  value,
  onToggle,
  onValueChange,
  onClearMessage,
}: InterestEstimatorRowProps) {
  const checkboxId = `lead-interest-${kind}-${item.id}`;
  const inputId = `lead-interest-${kind}-${item.id}-value`;

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <input
          id={checkboxId}
          type="checkbox"
          checked={selected}
          onChange={onToggle}
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
              onClearMessage();
              const next = e.target.value === '' ? 0 : Number(e.target.value);
              if (Number.isNaN(next)) return;
              onValueChange(item.id, next);
            }}
            disabled={disabled}
            className="h-8 w-28 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <span className="text-[11px] text-gray-500">FCFA</span>
        </div>
      )}
    </div>
  );
}

export default function LeadInterestsEstimatorCard({
  products,
  services,
  partnerCompanies = [],
  customProducts = [],
  customServices = [],
  initialSaved,
  disabled,
  onSave,
  onAfterSave,
}: Props) {
  const [query, setQuery] = useState('');
  const [selectedPartnerCompanyId, setSelectedPartnerCompanyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<
    | { type: 'success' | 'error' | 'warn'; text: string }
    | null
  >(null);
  const [addingCustomProduct, setAddingCustomProduct] = useState(false);
  const [addingCustomService, setAddingCustomService] = useState(false);
  const [draftCustomProduct, setDraftCustomProduct] = useState('');
  const [draftCustomService, setDraftCustomService] = useState('');
  const [customProductItems, setCustomProductItems] = useState<InterestItemLite[]>(
    () =>
      customProducts.map((name) => ({
        id: makeCustomKey('product', name),
        name,
      })),
  );
  const [customServiceItems, setCustomServiceItems] = useState<InterestItemLite[]>(
    () =>
      customServices.map((name) => ({
        id: makeCustomKey('service', name),
        name,
      })),
  );

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
    const productById = new Map(
      [...products, ...customProductItems].map((item) => [item.id, item] as const),
    );
    const serviceById = new Map(
      [...services, ...customServiceItems].map((item) => [item.id, item] as const),
    );

    for (const [id, isSelected] of Object.entries(selectedProducts)) {
      if (!isSelected) continue;
      const custom = productById.get(id);
      if (id.startsWith('custom:product:') && custom) {
        items.push({
          kind: 'product',
          customName: custom.name,
          estimatedValue: values[id] ?? 0,
        });
      } else {
        items.push({ kind: 'product', id, estimatedValue: values[id] ?? 0 });
      }
    }
    for (const [id, isSelected] of Object.entries(selectedServices)) {
      if (!isSelected) continue;
      const custom = serviceById.get(id);
      if (id.startsWith('custom:service:') && custom) {
        items.push({
          kind: 'service',
          customName: custom.name,
          estimatedValue: values[id] ?? 0,
        });
      } else {
        items.push({ kind: 'service', id, estimatedValue: values[id] ?? 0 });
      }
    }
    return items;
  }, [customProductItems, customServiceItems, products, selectedProducts, selectedServices, services, values]);

  const currentFingerprint = useMemo(() => {
    const p = currentItems
      .filter((i) => i.kind === 'product')
      .map((i) => {
        const customName = 'customName' in i ? i.customName : '';
        const key =
          'id' in i && i.id ? i.id : `custom:${normalizeCustomName(customName || '')}`;
        return [key, i.estimatedValue] as const;
      })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => `${key}:${v}`)
      .join('|');
    const s = currentItems
      .filter((i) => i.kind === 'service')
      .map((i) => {
        const customName = 'customName' in i ? i.customName : '';
        const key =
          'id' in i && i.id ? i.id : `custom:${normalizeCustomName(customName || '')}`;
        return [key, i.estimatedValue] as const;
      })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => `${key}:${v}`)
      .join('|');
    return `p=${p};s=${s}`;
  }, [currentItems]);

  const dirty = currentFingerprint !== savedFingerprint;

  const totalEstimated = useMemo(
    () => currentItems.reduce((acc, i) => acc + (i.estimatedValue || 0), 0),
    [currentItems],
  );

  const selectedCount = currentItems.length;

  const selectedPartnerCompany = useMemo(
    () => partnerCompanies.find((company) => company.id === selectedPartnerCompanyId) ?? null,
    [partnerCompanies, selectedPartnerCompanyId],
  );

  const availableProducts = useMemo(() => {
    const merged = [
      ...products,
      ...(selectedPartnerCompany?.products ?? []),
      ...customProductItems,
    ];
    return Array.from(new Map(merged.map((item) => [item.id, item])).values());
  }, [customProductItems, products, selectedPartnerCompany]);

  const availableServices = useMemo(() => {
    const merged = [
      ...services,
      ...(selectedPartnerCompany?.services ?? []),
      ...customServiceItems,
    ];
    return Array.from(new Map(merged.map((item) => [item.id, item])).values());
  }, [customServiceItems, services, selectedPartnerCompany]);

  const normalized = normalizeQuery(query);
  const filteredProducts = useMemo(() => {
    if (!normalized) return availableProducts;
    return availableProducts.filter((p) => p.name.toLowerCase().includes(normalized));
  }, [availableProducts, normalized]);

  const filteredServices = useMemo(() => {
    if (!normalized) return availableServices;
    return availableServices.filter((s) => s.name.toLowerCase().includes(normalized));
  }, [availableServices, normalized]);

  const canSearch =
    (availableProducts?.length ?? 0) + (availableServices?.length ?? 0) > 12;

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
            .map((i) => {
              const key =
                'id' in i && i.id
                  ? i.id
                  : makeCustomKey('product', ('customName' in i && i.customName) ? i.customName : '');
              return [key, i.estimatedValue] as const;
            }),
        ),
        services: Object.fromEntries(
          currentItems
            .filter((i) => i.kind === 'service')
            .map((i) => {
              const key =
                'id' in i && i.id
                  ? i.id
                  : makeCustomKey('service', ('customName' in i && i.customName) ? i.customName : '');
              return [key, i.estimatedValue] as const;
            }),
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

  const handleRowToggle = (
    kind: InterestKind,
    item: InterestItemLite,
    isSelected: boolean,
  ) => {
    if (disabled) return;
    setMessage(null);
    if (kind === 'product') {
      setSelectedProducts((prev) => ({ ...prev, [item.id]: !isSelected }));
    } else {
      setSelectedServices((prev) => ({ ...prev, [item.id]: !isSelected }));
    }
    if (!isSelected && values[item.id] === undefined) {
      setValues((prev) => ({ ...prev, [item.id]: 0 }));
    }
  };

  const addCustomItem = (kind: InterestKind) => {
    const draft = kind === 'product' ? draftCustomProduct : draftCustomService;
    const cleaned = draft.trim().replace(/\s+/g, ' ');
    if (cleaned.length < 2) {
      setMessage({
        type: 'warn',
        text: 'Le nom personnalisé doit contenir au moins 2 caractères.',
      });
      return;
    }
    const normalized = normalizeCustomName(cleaned);
    const existingNames =
      kind === 'product'
        ? availableProducts.map((item) => normalizeCustomName(item.name))
        : availableServices.map((item) => normalizeCustomName(item.name));
    if (existingNames.includes(normalized)) {
      setMessage({
        type: 'warn',
        text: `Cet ${kind === 'product' ? 'élément produit' : 'élément service'} existe déjà.`,
      });
      return;
    }

    const id = makeCustomKey(kind, cleaned);
    const item = { id, name: cleaned };

    if (kind === 'product') {
      setCustomProductItems((prev) => [...prev, item]);
      setSelectedProducts((prev) => ({ ...prev, [id]: true }));
      setValues((prev) => ({ ...prev, [id]: prev[id] ?? 0 }));
      setDraftCustomProduct('');
      setAddingCustomProduct(false);
    } else {
      setCustomServiceItems((prev) => [...prev, item]);
      setSelectedServices((prev) => ({ ...prev, [id]: true }));
      setValues((prev) => ({ ...prev, [id]: prev[id] ?? 0 }));
      setDraftCustomService('');
      setAddingCustomService(false);
    }
    setMessage(null);
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
          FCFA
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

      <div className="rounded-2xl bg-white/60 border border-white/60 p-3 shadow-neu-soft space-y-2">
        <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
          Vente multi-entreprises
        </p>
        <label className="block text-[11px] text-gray-600">
          Entreprise partenaire
          <select
            value={selectedPartnerCompanyId}
            onChange={(e) => setSelectedPartnerCompanyId(e.target.value)}
            disabled={disabled || partnerCompanies.length === 0}
            className="mt-1 w-full h-9 rounded-xl border border-gray-200 px-3 text-[11px] bg-white/80 focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-60"
          >
            <option value="">Choisir une entreprise…</option>
            {partnerCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        {selectedPartnerCompany ? (
          <p className="text-[10px] text-gray-500">
            {selectedPartnerCompany.products.length} produit(s) et {selectedPartnerCompany.services.length}{' '}
            service(s) ajoutés au catalogue ci-dessous.
          </p>
        ) : (
          <p className="text-[10px] text-gray-500">
            Choisissez une entreprise pour afficher automatiquement ses produits et services.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-2xl bg-white/60 border border-white/60 p-3 shadow-neu-soft">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
              Produits
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setAddingCustomProduct((prev) => !prev);
                setMessage(null);
              }}
              className="text-[10px] text-primary font-medium hover:underline disabled:opacity-60"
            >
              + Autre
            </button>
          </div>
          {addingCustomProduct && (
            <div className="mb-2 flex items-center gap-2">
              <input
                value={draftCustomProduct}
                onChange={(e) => setDraftCustomProduct(e.target.value)}
                placeholder="Nom du produit personnalisé"
                disabled={disabled}
                className="h-8 flex-1 rounded-xl border border-gray-200 px-3 text-[11px] bg-white"
              />
              <button
                type="button"
                onClick={() => addCustomItem('product')}
                disabled={disabled}
                className="h-8 px-3 rounded-xl bg-primary text-white text-[11px] disabled:opacity-60"
              >
                Valider
              </button>
            </div>
          )}
          {filteredProducts.length === 0 ? (
            <p className="text-[11px] text-gray-500">Aucun produit.</p>
          ) : (
            <div className="flex flex-col">
              {filteredProducts.map((p) => (
                <InterestEstimatorRow
                  key={p.id}
                  kind="product"
                  item={p}
                  selected={!!selectedProducts[p.id]}
                  disabled={disabled}
                  value={values[p.id] ?? 0}
                  onToggle={() =>
                    handleRowToggle('product', p, !!selectedProducts[p.id])
                  }
                  onValueChange={(id, next) =>
                    setValues((prev) => ({ ...prev, [id]: next }))
                  }
                  onClearMessage={() => setMessage(null)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white/60 border border-white/60 p-3 shadow-neu-soft">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
              Services
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setAddingCustomService((prev) => !prev);
                setMessage(null);
              }}
              className="text-[10px] text-primary font-medium hover:underline disabled:opacity-60"
            >
              + Autre
            </button>
          </div>
          {addingCustomService && (
            <div className="mb-2 flex items-center gap-2">
              <input
                value={draftCustomService}
                onChange={(e) => setDraftCustomService(e.target.value)}
                placeholder="Nom du service personnalisé"
                disabled={disabled}
                className="h-8 flex-1 rounded-xl border border-gray-200 px-3 text-[11px] bg-white"
              />
              <button
                type="button"
                onClick={() => addCustomItem('service')}
                disabled={disabled}
                className="h-8 px-3 rounded-xl bg-primary text-white text-[11px] disabled:opacity-60"
              >
                Valider
              </button>
            </div>
          )}
          {filteredServices.length === 0 ? (
            <p className="text-[11px] text-gray-500">Aucun service.</p>
          ) : (
            <div className="flex flex-col">
              {filteredServices.map((s) => (
                <InterestEstimatorRow
                  key={s.id}
                  kind="service"
                  item={s}
                  selected={!!selectedServices[s.id]}
                  disabled={disabled}
                  value={values[s.id] ?? 0}
                  onToggle={() =>
                    handleRowToggle('service', s, !!selectedServices[s.id])
                  }
                  onValueChange={(id, next) =>
                    setValues((prev) => ({ ...prev, [id]: next }))
                  }
                  onClearMessage={() => setMessage(null)}
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

