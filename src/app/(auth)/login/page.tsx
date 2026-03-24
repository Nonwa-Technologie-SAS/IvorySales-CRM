"use client";

import { Field } from "@/components/ui/field";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  // Hook Next.js pour effectuer une redirection côté client après connexion
  const router = useRouter();

  // États locaux pour gérer le chargement et l'affichage d'un message d'erreur
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Soumission du formulaire de connexion
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // On récupère les valeurs du formulaire via FormData
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setLoading(true);
    setError(null);

    try {
      // Appel à notre API interne Next.js qui vérifie email + mot de passe
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Impossible de se connecter");
      }

      if (data.requiresMfa) {
        const from = new URLSearchParams(window.location.search).get("from") || "";
        const mfaUrl = from ? `/login/mfa?from=${encodeURIComponent(from)}` : "/login/mfa";
        router.push(mfaUrl);
        return;
      }

      window.dispatchEvent(new Event("auth:changed"));
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050018] text-slate-900">
      {/* Colonne gauche : carte de login */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo + titre */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                K
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary">
                  KpiTracker
                </span>
                <span className="text-[11px] text-gray-500">
                  Portail sécurisé des équipes commerciales
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-4">
              <h1 className="text-2xl font-semibold text-primary">Login</h1>
              <p className="text-sm text-gray-500">
                Utilisez de préférence votre adresse email professionnelle.
              </p>
            </div>
          </div>

          {/* Formulaire de connexion */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-neu-soft"
          >
            <div className="space-y-4">
              <Field
                name="email"
                type="email"
                label="Adresse email"
                placeholder="vous@entreprise.ci"
                required
              />
              <Field
                name="password"
                type="password"
                label="Mot de passe"
                placeholder="Votre mot de passe"
                required
              />
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-500 border border-rose-100 bg-rose-50/80 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Texte bas de page */}
          <div className="space-y-1.5 text-[11px] text-gray-500">
            <p>
              Pas encore de compte ?{" "}
              <span className="font-medium text-violet-600">
                Contactez l&apos;administrateur.
              </span>
            </p>
            <p className="text-[10px] leading-relaxed">
              En vous connectant, vous acceptez nos{" "}
              <span className="font-medium text-violet-600">
                Conditions d&apos;utilisation
              </span>{" "}
              et notre{" "}
              <span className="font-medium text-violet-600">
                Politique de confidentialité
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Colonne droite : visuel marketing */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050018] via-[#12023a] to-[#3b1ddc]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12)_0,_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(88,28,135,0.4)_0,_transparent_60%)]" />

        <div className="relative z-10 flex h-full items-center justify-center px-10">
          <div className="max-w-md space-y-5 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-violet-100 ring-1 ring-white/20">
              Pipeline commercial en temps réel
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              Suivez vos leads, objectifs et rendez-vous en un seul endroit.
            </h2>
            <p className="text-sm text-violet-100/80 leading-relaxed">
              Centralisez votre prospection, vos relances et vos ventes dans un
              KpiTracker pensé pour les équipes commerciales en Côte d&apos;Ivoire.
              Visualisez vos performances et atteignez vos objectifs plus
              rapidement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
