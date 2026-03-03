"use client";

import { useEffect, useState, type FormEvent } from "react";
import NeumoCard from "./NeumoCard";
import { Field } from "./ui/field";
export interface ClientForSheet {
  id: string;
  name: string;
  contact?: string | null;
  totalRevenue: number;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  civility?: string | null;
  activityDomain?: string | null;
  companyName?: string | null;
  location?: string | null;
  notes?: string | null;
  company?: { id: string; name: string } | null;
  convertedById?: string | null;
  convertedAt?: string | null;
  convertedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

type InterestKind = "product" | "service";

interface InterestItem {
  kind: InterestKind;
  id: string;
  estimatedValue: number;
}

interface SelectOption {
  id: string;
  name: string;
}

interface ClientEditSheetProps {
  open: boolean;
  client: ClientForSheet | null;
  onClose: () => void;
  onUpdated?: (client: ClientForSheet) => void;
}

export default function ClientEditSheet({
  open,
  client,
  onClose,
  onUpdated,
}: ClientEditSheetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([]);
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [interestsError, setInterestsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !client) return;

    const loadOptionsAndInterests = async () => {
      setInterestsLoading(true);
      setInterestsError(null);
      try {
        const [productsRes, servicesRes, interestsRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/services"),
          fetch(`/api/clients/${client.id}/interests`),
        ]);

        if (productsRes.ok) {
          const products = (await productsRes.json()) as SelectOption[];
          setProductOptions(products);
        }

        if (servicesRes.ok) {
          const services = (await servicesRes.json()) as SelectOption[];
          setServiceOptions(services);
        }

        if (interestsRes.ok) {
          const data = (await interestsRes.json()) as {
            products: { kind: "product"; id: string; estimatedValue: number }[];
            services: { kind: "service"; id: string; estimatedValue: number }[];
          };
          setInterests([
            ...data.products,
            ...data.services,
          ]);
        } else if (interestsRes.status !== 404) {
          // 404 = pas encore d'intérêts enregistrés
          const body = await interestsRes.json().catch(() => ({}));
          throw new Error(
            body.error || "Impossible de charger les intérêts du client",
          );
        }
      } catch (err: unknown) {
        setInterestsError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des intérêts",
        );
      } finally {
        setInterestsLoading(false);
      }
    };

    loadOptionsAndInterests();
  }, [open, client]);

  if (!open || !client) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") || "").trim();
    const contact = String(new FormData(form).get("contact") || "").trim() || null;
    const totalRevenue = parseFloat(
      String(new FormData(form).get("totalRevenue") || "0").replace(",", ".")
    );

    if (!name) {
      setError("Le nom est requis.");
      return;
    }

    // Valider les intérêts : s'assurer que chaque ligne a un produit/service sélectionné
    const invalidInterests = interests.filter(
      (item) => !item.id || item.id.trim() === ""
    );

    if (invalidInterests.length > 0) {
      setError(
        "Veuillez sélectionner un produit ou service pour chaque ligne ajoutée, ou retirez les lignes vides."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filtrer uniquement les intérêts valides (avec id non vide)
      const validInterests = interests.filter(
        (item) => item.id && item.id.trim() !== ""
      );

      const [clientRes, interestsRes] = await Promise.all([
        fetch(`/api/clients/${client.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            contact,
            totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
          }),
        }),
        fetch(`/api/clients/${client.id}/interests`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: validInterests.map((item) => ({
              kind: item.kind,
              id: item.id,
              estimatedValue: item.estimatedValue || 0,
            })),
          }),
        }),
      ]);

      if (!clientRes.ok) {
        const body = await clientRes.json().catch(() => ({}));
        throw new Error(body.error || "Impossible de modifier le client");
      }

      if (!interestsRes.ok) {
        const body = await interestsRes.json().catch(() => ({}));
        const errorMessage =
          body.error ||
          body.details ||
          "Impossible d'enregistrer les produits/services du client";
        throw new Error(errorMessage);
      }

      const updated = (await clientRes.json()) as ClientForSheet;
      onUpdated?.(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = (kind: InterestKind) => {
    setInterests((prev) => [
      ...prev,
      {
        kind,
        id: "",
        estimatedValue: 0,
      },
    ]);
  };

  const handleUpdateInterest = (
    index: number,
    patch: Partial<InterestItem>,
  ) => {
    setInterests((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const handleRemoveInterest = (index: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== index));
  };

  const totalEstimated = interests.reduce(
    (sum, item) =>
      sum +
      (Number.isFinite(item.estimatedValue) ? item.estimatedValue : 0),
    0,
  );

  const COMMISSION_RATE = 0.03;
  const estimatedCommission = totalEstimated * COMMISSION_RATE;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm">
      <div
        className="h-full w-full max-w-md bg-transparent p-4"
        onClick={onClose}
      >
        <div className="h-full" onClick={(e) => e.stopPropagation()}>
          <NeumoCard className="max-h-[90vh] overflow-y-auto bg-white p-5 flex flex-col gap-4 shadow-neu-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-primary">
                Modifier le client
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 text-xs text-gray-700"
            >
              <Field
                name="name"
                label="Nom du client"
                defaultValue={client.name}
                required
              />
              <Field
                name="contact"
                label="Contact (téléphone ou email)"
                defaultValue={client.contact ?? ""}
              />
              <Field
                name="totalRevenue"
                label="CA total (FCFA)"
                type="number"
                step="0.01"
                defaultValue={String(client.totalRevenue)}
              />
              <p className="text-[10px] text-gray-400">
                Société : {client.company?.name ?? "—"} (non modifiable ici)
              </p>

              <div className="mt-4 space-y-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-primary">
                    Produits &amp; services intéressants
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddInterest("product")}
                      className="px-2 py-1 rounded-full bg-white border border-gray-200 text-[10px] text-gray-700"
                    >
                      + Produit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddInterest("service")}
                      className="px-2 py-1 rounded-full bg-white border border-gray-200 text-[10px] text-gray-700"
                    >
                      + Service
                    </button>
                  </div>
                </div>

                {interestsLoading && (
                  <p className="text-[10px] text-gray-400">
                    Chargement des produits et services...
                  </p>
                )}

                {interestsError && (
                  <p className="text-[10px] text-rose-500">{interestsError}</p>
                )}

                {interests.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {interests.map((item, index) => {
                      const options =
                        item.kind === "product"
                          ? productOptions
                          : serviceOptions;
                      const labelPrefix =
                        item.kind === "product" ? "Produit" : "Service";
                      return (
                        <div
                          key={index}
                          className="flex flex-col gap-1 rounded-xl bg-white border border-gray-200 p-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-gray-500">
                              {labelPrefix}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(index)}
                              className="text-[10px] text-gray-400 hover:text-rose-500"
                            >
                              Retirer
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={item.id}
                              onChange={(e) =>
                                handleUpdateInterest(index, {
                                  id: e.target.value,
                                })
                              }
                              className="h-8 rounded-xl border border-gray-200 bg-gray-50 px-2 text-[11px] flex-1 min-w-0"
                            >
                              <option value="">
                                Sélectionner {labelPrefix.toLowerCase()}
                              </option>
                              {options.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={Number.isNaN(item.estimatedValue) ? "" : item.estimatedValue}
                              onChange={(e) =>
                                handleUpdateInterest(index, {
                                  estimatedValue:
                                    parseFloat(e.target.value.replace(",", ".")) ||
                                    0,
                                })
                              }
                              className="h-8 rounded-xl border border-gray-200 bg-gray-50 px-2 text-[11px] w-full sm:w-32"
                              placeholder="Valeur estimée"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {interests.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 text-[10px] text-gray-600">
                    <div className="flex justify-between">
                      <span>Montant total estimé</span>
                      <span className="font-semibold">
                        {totalEstimated.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission commerciale (3 %)</span>
                      <span className="font-semibold text-primary">
                        {estimatedCommission.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-[11px] text-rose-500 mt-1">{error}</p>
              )}

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
