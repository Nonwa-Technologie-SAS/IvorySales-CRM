"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { withDashboardLayout } from "@/components/layouts/withDashboardLayout";

type SettingsTab = "organization" | "legal";

interface CurrentOrg {
  companyName: string;
  companyPlan?: string;
  companyCreatedAt?: string;
  contactEmail?: string;
}

function SettingsPageInner() {
  const router = useRouter();
  const { user: authUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("organization");
  const [org, setOrg] = useState<CurrentOrg | null>(null);

  // Garde : Paramètres globaux et utilisateurs réservés à ADMIN/MANAGER (AGENT redirigé)
  useEffect(() => {
    if (loading) return;
    if (!authUser || authUser.role === "agent") {
      router.replace("/");
      return;
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const createdAt = data.company?.createdAt
          ? new Date(data.company.createdAt).toLocaleDateString("fr-FR")
          : undefined;
        setOrg({
          companyName: data.company?.name ?? "",
          companyPlan: data.company?.plan,
          companyCreatedAt: createdAt,
          contactEmail: data.email ?? undefined,
        });
      })
      .catch(() => setOrg(null));
  }, []);

  const tabs: { key: SettingsTab; label: string; icon: typeof Briefcase; adminOnly?: boolean }[] = [
    { key: "organization", label: "Organisation", icon: Briefcase },
    {
      key: "legal",
      label: "Données & CGV / FAQ",
      icon: FileText,
      adminOnly: true,
    },
  ];
  const visibleTabs =
    authUser && (authUser.role === "admin" || authUser.role === "manager")
      ? tabs
      : tabs.filter((t) => !t.adminOnly);

  if (loading || !authUser || authUser.role === "agent") {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500 text-sm">
        Chargement…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <section>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">
          {org?.companyName || "Configuration de l'entreprise et des préférences"}
        </p>
      </section>

      {/* Onglets */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-gray-100 border border-gray-100">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-primary shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-white/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === "organization" && (
        <>
          {/* Détails de l'organisation */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base font-semibold text-primary">
                Détails de l'organisation
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Carte 1 : Vue d'ensemble entreprise */}
              <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-neu-soft flex flex-col items-center text-center min-h-[180px]">
                <button
                  type="button"
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-primary"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center mb-3">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-primary">
                  {org?.companyName || "Nom de l'entreprise"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {org?.companyName
                    ? "Votre entreprise sur le CRM."
                    : "Slogan ou description courte."}
                </p>
              </div>

              {/* Carte 2 : Informations personnelles / contact */}
              <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-neu-soft lg:col-span-2">
                <button
                  type="button"
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-primary"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-semibold text-primary mb-4">
                  Informations de contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[11px] md:text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>—</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{org?.contactEmail ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>—</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      Date d&apos;ajout : {org?.companyCreatedAt ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>N° enregistrement : —</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Pays / Région : —</span>
                  </div>
                </div>
              </div>

              {/* Carte 3 : Adresse de l'entreprise */}
              <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-neu-soft lg:col-span-3">
                <button
                  type="button"
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-primary"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-semibold text-primary mb-4">
                  Adresse de l&apos;entreprise
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[11px] md:text-xs text-gray-600">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Pays</span>
                    <span>—</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Ville</span>
                    <span>—</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Région / État</span>
                    <span>—</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Rue</span>
                    <span>—</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Bâtiment / Bureau</span>
                    <span>—</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Code postal</span>
                    <span>—</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </>
      )}

      {activeTab === "legal" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-neu-soft space-y-6">
          <section>
            <h2 className="text-base font-semibold text-primary mb-1">
              Politique de protection des données
            </h2>
            <p className="text-sm text-gray-500">
              Décrivez ici comment les données des prospects, clients et utilisateurs
              sont collectées, stockées et protégées, conformément aux lois en vigueur
              en Côte d&apos;Ivoire.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-primary mb-1">FAQ</h2>
            <p className="text-sm text-gray-500">
              Regroupez les questions fréquentes de vos commerciaux et managers
              (ex. import de leads, objectifs, agenda, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-primary mb-1">
              Conditions Générales de Vente (CGV)
            </h2>
            <p className="text-sm text-gray-500">
              Ajoutez ou liez ici vos CGV applicables aux prestations gérées via le CRM.
            </p>
          </section>
        </div>
      )}

    </div>
  );
}

const SettingsPage = withDashboardLayout(SettingsPageInner);

export default SettingsPage;
