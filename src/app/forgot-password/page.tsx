"use client";

import { Field } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const email = String(formData.get("email") ?? "").trim();

      // TODO: remplacer par l'appel réel à l'API d'envoi de lien
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Impossible d'envoyer le lien de réinitialisation."
        );
      }
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'envoi du lien."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050018] text-slate-900">
      {/* Colonne gauche : carte Mot de passe oublié */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-4 py-10">
        <div className="w-full max-w-md px-2 sm:px-4 space-y-8">
          {/* Logo + nom app */}
          <div className="mb-2 flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-md">
              K
            </div>
            <span className="text-sm font-semibold text-gray-800">
              KpiTracker
            </span>
          </div>

          {/* Titre + sous-titre */}
          <div className="space-y-1 pt-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Mot de passe oublié
            </h1>
            <p className="text-sm text-gray-500">
              Entrez l&apos;adresse email de votre compte pour recevoir un lien de
              réinitialisation.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <Field
              name="email"
              type="email"
              label="Adresse email"
              placeholder="vous@entreprise.ci"
              required
            />

            {error && (
              <p className="text-xs text-rose-500">
                {error}
              </p>
            )}

            {sent && !error && (
              <p className="text-xs text-emerald-600">
                Si un compte existe pour cet email, un lien vient d&apos;être envoyé.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 rounded-lg bg-violet-600 text-white text-sm font-medium shadow-md hover:bg-violet-700 transition-colors disabled:opacity-60"
            >
              {loading
                ? "Envoi en cours..."
                : "Envoyer le lien de réinitialisation"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 text-xs text-gray-500 hover:text-gray-700"
          >
            Retour à la connexion
          </button>

          <p className="mt-6 text-[10px] text-gray-400">
            En poursuivant, vous acceptez nos{" "}
            <span className="text-violet-600">
              Conditions d&apos;utilisation
            </span>{" "}
            et notre{" "}
            <span className="text-violet-600">
              Politique de confidentialité
            </span>
            .
          </p>
        </div>
      </div>

      {/* Colonne droite : décor violet / sécurité */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050018] via-[#12023a] to-[#3b1ddc]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#ffffff40_1px,transparent_0)] bg-[length:40px_40px]" />
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-md px-8 text-sm text-white/80 space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
              Sécurité & récupération de compte
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Récupérez l&apos;accès à votre espace KpiTracker en toute simplicité.
            </h2>
            <p className="text-sm text-white/70">
              Entrez votre adresse professionnelle, nous vous enverrons un lien de
              réinitialisation pour que vous puissiez reprendre vos activités
              commerciales rapidement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
