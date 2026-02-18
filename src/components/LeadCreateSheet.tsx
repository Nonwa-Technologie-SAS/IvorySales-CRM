"use client";

import { useEffect, useState, type FormEvent } from "react";
import NeumoCard from "./NeumoCard";
import { Field } from "./ui/field";
import {
  DEFAULT_ACTIVITY_DOMAINS,
  DEFAULT_CIVILITIES,
  DEFAULT_LEAD_SOURCES,
} from "@/config/lead-options";

interface LeadCreateSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (lead: any) => void;
}

// Options alignées avec l'enum LeadStatus du schema Prisma
const STATUS_OPTIONS = [
  { value: "NEW", label: "Nouveau lead" },
  { value: "CONTACTED", label: "Contacté" },
  { value: "QUALIFIED", label: "Qualifié" },
  { value: "CONVERTED", label: "Converti" },
  { value: "LOST", label: "Perdu" },
];

export default function LeadCreateSheet({ open, onClose, onCreated }: LeadCreateSheetProps) {
  const [status, setStatus] = useState("NEW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    // Charger une fois la liste des produits/services
    const fetchData = async () => {
      try {
        const [prodRes, servRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/services"),
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data);
        }
        if (servRes.ok) {
          const data = await servRes.json();
          setServices(data);
        }
      } catch {
        // silencieux pour le MVP
      }
    };
    fetchData();
  }, [open]);

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const firstName = String(data.get("firstName") || "");
    const lastName = String(data.get("lastName") || "");
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const source = String(data.get("source") || "");
    const activityDomain = String(data.get("activityDomain") || "");
    const civility = String(data.get("civility") || "");
    const notes = String(data.get("notes") || "");
    const companyName = String(data.get("companyName") || "");
    const location = String(data.get("location") || "");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email || undefined,
          phone: phone || undefined,
          source: source || undefined,
          activityDomain: activityDomain || undefined,
          civility: civility || undefined,
          companyName: companyName || undefined,
          location: location || undefined,
          notes: notes || undefined,
          // laissé vide côté front, l'API rattache à une company par défaut
          status,
          companyId: undefined,
          productIds: selectedProductIds,
          serviceIds: selectedServiceIds,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Impossible de créer le lead");
      }

      const created = await res.json();
      onCreated?.(created);
      form.reset();
      setStatus("NEW");
      setSelectedProductIds([]);
      setSelectedServiceIds([]);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-transparent p-4" onClick={onClose}>
        <div
          className="h-full"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <NeumoCard className="h-full max-h-[90vh] bg-white p-5 flex flex-col gap-4 shadow-neu-soft overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-primary">Nouveau lead</h2>
                <p className="text-[11px] text-gray-500">
                  Enregistrez un prospect dans votre pipeline.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col gap-3 text-xs text-gray-700 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Field name="firstName" label="Prénom" placeholder="Ex: Awa" required />
                <Field name="lastName" label="Nom" placeholder="Ex: Koné" required />
              </div>
              <Field name="email" type="email" label="Email" placeholder="awa@example.com" />
              <Field name="phone" label="Téléphone" placeholder="Ex: +225 07 45 12 89" />
              <Field
                name="companyName"
                label="Nom de la compagnie"
                placeholder="Ex: Appatam Sarl"
                description="Nom de l'entreprise rattachée à ce lead."
              />
              <Field
                name="location"
                label="Localisation"
                placeholder="Adresse ou lieu (pour la carte)"
                description="Adresse ou localisation géographique du lead."
              />
              <Field
                name="source"
                label="Source"
                placeholder="Facebook, WhatsApp, Site web..."
                description="Permet d'analyser d'où viennent vos leads."
                list="lead-source-options"
              />
              <datalist id="lead-source-options">
                {DEFAULT_LEAD_SOURCES.map((src) => (
                  <option key={src} value={src} />
                ))}
              </datalist>
              <Field
                name="activityDomain"
                label="Domaine d'activités"
                placeholder="Ex: BTP, Agroalimentaire..."
                description="Secteur ou domaine d'activité principal du lead."
                list="lead-activity-options"
              />
              <datalist id="lead-activity-options">
                {DEFAULT_ACTIVITY_DOMAINS.map((domain) => (
                  <option key={domain} value={domain} />
                ))}
              </datalist>
              <Field
                name="civility"
                label="Civilité"
                placeholder="Ex: M., Mme..."
                description="Civilité du contact (si renseignée dans le fichier Excel)."
                list="lead-civility-options"
              />
              <datalist id="lead-civility-options">
                {DEFAULT_CIVILITIES.map((civ) => (
                  <option key={civ} value={civ} />
                ))}
              </datalist>
              <Field
                name="notes"
                label="Notes"
                placeholder="Observations ou commentaires sur le lead"
                description="Ces notes pourront aussi venir de la colonne 'observation' de l'Excel."
              />

              {(products.length > 0 || services.length > 0) && (
                <div className="mt-2 flex flex-col gap-2">
                  <span className="text-[11px] text-gray-500">
                    Intérêt pour des produits / services
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {products.length > 0 && (
                      <div className="flex flex-col gap-1 rounded-2xl bg-gray-50 border border-gray-100 p-2">
                        <span className="text-[11px] font-medium text-gray-600">
                          Produits
                        </span>
                        <div className="max-h-24 overflow-y-auto pr-1 flex flex-col gap-1">
                          {products.map((p) => (
                            <label
                              key={p.id}
                              className="inline-flex items-center gap-2 text-[11px] text-gray-700"
                            >
                              <input
                                type="checkbox"
                                className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary/40"
                                checked={selectedProductIds.includes(p.id)}
                                onChange={() => toggleProduct(p.id)}
                              />
                              <span className="truncate">{p.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {services.length > 0 && (
                      <div className="flex flex-col gap-1 rounded-2xl bg-gray-50 border border-gray-100 p-2">
                        <span className="text-[11px] font-medium text-gray-600">
                          Services
                        </span>
                        <div className="max-h-24 overflow-y-auto pr-1 flex flex-col gap-1">
                          {services.map((s) => (
                            <label
                              key={s.id}
                              className="inline-flex items-center gap-2 text-[11px] text-gray-700"
                            >
                              <input
                                type="checkbox"
                                className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary/40"
                                checked={selectedServiceIds.includes(s.id)}
                                onChange={() => toggleService(s.id)}
                              />
                              <span className="truncate">{s.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] text-gray-500">Statut</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-8 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-full text-[11px] bg-gray-100 text-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-full text-[11px] bg-primary text-white shadow-neu disabled:opacity-60"
                >
                  {loading ? "En cours..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </NeumoCard>
        </div>
      </div>
    </div>
  );
}
