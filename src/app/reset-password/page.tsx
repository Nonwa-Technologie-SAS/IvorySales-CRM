"use client";

import { Field } from "@/components/ui/field";
import { withOfflineLayout } from "@/components/layouts/withOfflineLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function ResetPasswordPageInner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (newPassword !== passwordConfirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Impossible de changer le mot de passe.");
      }
      setLoading(false);
      setDone(true);
      setTimeout(() => router.replace("/"), 1000);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <h1 className="text-xl font-semibold text-primary">Nouveau mot de passe</h1>
        <p className="text-[11px] text-gray-500 mt-1">
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
        <Field
          name="currentPassword"
          type="password"
          label="Mot de passe temporaire"
          placeholder="Votre mot de passe actuel"
          required
          minLength={6}
        />
        <Field
          name="password"
          type="password"
          label="Nouveau mot de passe"
          placeholder="Min. 6 caractères"
          required
          minLength={6}
        />
        <Field
          name="passwordConfirm"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="Retapez le mot de passe"
          required
          minLength={6}
        />

        {done && (
          <p className="text-[11px] text-emerald-600">
            Mot de passe mis à jour. Redirection en cours...
          </p>
        )}
        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 px-4 py-2 rounded-full bg-primary text-white text-[11px] font-medium shadow-neu disabled:opacity-60"
        >
          {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </button>
      </form>

      <div className="flex flex-col gap-1 text-[11px] text-gray-500 mt-2">
        <Link href="/login" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

const ResetPasswordPage = withOfflineLayout(ResetPasswordPageInner);

export default ResetPasswordPage;
