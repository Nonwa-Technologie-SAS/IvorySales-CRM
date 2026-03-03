"use client";

import NeumoCard from "./NeumoCard";
import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  TrendingUp,
  User,
  Wrench,
} from "lucide-react";
import type { ClientForSheet } from "./ClientEditSheet";
import { useEffect, useState } from "react";

interface ClientViewSheetProps {
  open: boolean;
  client: ClientForSheet | null;
  onClose: () => void;
}

export default function ClientViewSheet({
  open,
  client,
  onClose,
}: ClientViewSheetProps) {
  const [interests, setInterests] = useState<
    { kind: "product" | "service"; name: string; estimatedValue: number }[]
  >([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [errorInterests, setErrorInterests] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !client) return;

    const loadInterests = async () => {
      setLoadingInterests(true);
      setErrorInterests(null);
      try {
        const res = await fetch(`/api/clients/${client.id}/interests`);
        if (!res.ok) {
          if (res.status === 404) {
            setInterests([]);
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || "Impossible de récupérer les intérêts du client",
          );
        }
        const data = (await res.json()) as {
          products: {
            kind: "product";
            name: string;
            estimatedValue: number;
          }[];
          services: {
            kind: "service";
            name: string;
            estimatedValue: number;
          }[];
        };
        setInterests([...data.products, ...data.services]);
      } catch (err: unknown) {
        setErrorInterests(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des intérêts",
        );
      } finally {
        setLoadingInterests(false);
      }
    };

    loadInterests();
  }, [open, client]);

  if (!open || !client) return null;

  const products = interests.filter((i) => i.kind === "product");
  const services = interests.filter((i) => i.kind === "service");

  const totalProducts = products.reduce(
    (sum, item) =>
      sum +
      (Number.isFinite(item.estimatedValue) ? item.estimatedValue : 0),
    0,
  );
  const totalServices = services.reduce(
    (sum, item) =>
      sum +
      (Number.isFinite(item.estimatedValue) ? item.estimatedValue : 0),
    0,
  );

  const totalEstimated = totalProducts + totalServices;
  const COMMISSION_RATE = 0.03;
  const estimatedCommission = totalEstimated * COMMISSION_RATE;
  const realizedCommission = client.totalRevenue * COMMISSION_RATE;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm">
      <div
        className="h-full w-full max-w-md bg-transparent p-4"
        onClick={onClose}
      >
        <div className="h-full" onClick={(e) => e.stopPropagation()}>
          <NeumoCard className="max-h-[90vh] overflow-y-auto bg-white p-5 flex flex-col gap-4 shadow-neu-soft">
            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-primary">
                Détails du client
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* 1. Identité — priorité haute */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/90 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Identité
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Nom complet</span>
                <span className="text-gray-900 font-semibold truncate max-w-[60%] text-right">
                  {client.name}
                </span>
              </div>
              {client.civility && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Civilité</span>
                  <span className="text-gray-700">{client.civility}</span>
                </div>
              )}
            </div>

            {/* 2. Contact — priorité haute */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/90 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Contact
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {client.email && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500 shrink-0">Email</span>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-primary font-medium truncate text-right hover:underline"
                    >
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500 shrink-0">Téléphone</span>
                    <a
                      href={`tel:${client.phone}`}
                      className="text-gray-800 font-medium text-right hover:underline"
                    >
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.contact && !client.phone && !client.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Contact principal</span>
                    <span className="text-gray-700">{client.contact}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Converti par — traçabilité conversion */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/90 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Converti par</span>
                <span className="text-gray-800 font-medium">
                  {client.convertedBy?.name ?? "Non renseigné"}
                </span>
              </div>
              {client.convertedAt && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Date de conversion</span>
                  <span className="text-gray-700">
                    {new Date(client.convertedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* 3. Contexte commercial — société, source, secteur */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/90 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Contexte commercial
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Société</span>
                  <span className="text-gray-800 font-medium text-right">
                    {client.companyName ?? client.company?.name ?? "—"}
                  </span>
                </div>
                {client.source && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Source</span>
                    <span className="text-gray-700">{client.source}</span>
                  </div>
                )}
                {client.activityDomain && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500 shrink-0">Secteur</span>
                    <span className="text-gray-700 text-right">
                      {client.activityDomain}
                    </span>
                  </div>
                )}
                {client.location && (
                  <div className="flex items-start justify-between gap-2 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-right text-[10px]">
                      {client.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Chiffres clés — CA et commission (mis en évidence) */}
            <div className="rounded-2xl border-2 border-primary/25 bg-[#f0f0ff]/80 px-4 py-3 space-y-2 shadow-neu-soft">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Chiffres clés
                </span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/80">
                  <span className="text-gray-600">CA total réalisé</span>
                  <span className="text-gray-900 font-bold">
                    {client.totalRevenue.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-primary/5">
                  <span className="text-gray-600">
                    Commission commerciale (3 %)
                  </span>
                  <span className="text-primary font-bold">
                    {realizedCommission.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloc Produits & services — mis en évidence */}
            <div className="rounded-2xl border-2 border-primary/20 bg-[#f5f5ff]/90 px-4 py-3 space-y-3 shadow-neu-soft">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 w-8 h-8 rounded-xl bg-primary/10 justify-center">
                  <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                  <Wrench className="w-3.5 h-3.5 text-primary shrink-0" />
                </div>
                <span className="text-sm font-semibold text-primary">
                  Produits &amp; services intéressants
                </span>
              </div>
              {loadingInterests && (
                <p className="text-[11px] text-gray-400">
                  Chargement des produits et services...
                </p>
              )}
              {errorInterests && (
                <p className="text-[11px] text-rose-500">{errorInterests}</p>
              )}
              {!loadingInterests && !errorInterests && interests.length === 0 && (
                <p className="text-[11px] text-gray-500">
                  Aucun produit ou service enregistré pour ce client.
                </p>
              )}
              {interests.length > 0 && (
                <div className="space-y-3 text-[11px]">
                  {/* Produits */}
                  {products.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">
                          Produits ({products.length})
                        </span>
                        <span className="text-gray-800 font-semibold">
                          {totalProducts.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "XOF",
                          })}
                        </span>
                      </div>
                      <div className="space-y-1 border border-gray-100 rounded-xl bg-gray-50/60 px-2 py-1.5">
                        {products.map((item, index) => (
                          <div
                            key={`product-${index}`}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-gray-600">
                              <span className="font-medium text-gray-800">
                                {item.name}
                              </span>
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {item.estimatedValue.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "XOF",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {services.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">
                          Services ({services.length})
                        </span>
                        <span className="text-gray-800 font-semibold">
                          {totalServices.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "XOF",
                          })}
                        </span>
                      </div>
                      <div className="space-y-1 border border-gray-100 rounded-xl bg-gray-50/60 px-2 py-1.5">
                        {services.map((item, index) => (
                          <div
                            key={`service-${index}`}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-gray-600">
                              <span className="font-medium text-gray-800">
                                {item.name}
                              </span>
                            </span>
                            <span className="text-gray-900 font-semibold">
                              {item.estimatedValue.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "XOF",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Totaux globaux */}
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Montant total estimé (pipeline)
                      </span>
                      <span className="font-semibold">
                        {totalEstimated.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Commission commerciale estimée (3 %)
                      </span>
                      <span className="font-semibold text-primary">
                        {estimatedCommission.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Notes — complément d'information */}
            {client.notes && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50/90 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Notes
                  </span>
                </div>
                <p className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {client.notes}
                </p>
              </div>
            )}
          </NeumoCard>
        </div>
      </div>
    </div>
  );
}
