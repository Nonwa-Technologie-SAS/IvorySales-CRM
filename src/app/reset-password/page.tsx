"use client";

import { Field } from "@/components/ui/field";
import { withOfflineLayout } from "@/components/layouts/withOfflineLayout";
import Link from "next/link";
import { useState, type FormEvent } from "react";

function ResetPasswordPageInner() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // TODO: appeler API de réinitialisation réelle avec token
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 800);
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
            Mot de passe mis à jour. Vous pouvez maintenant vous connecter.
          </p>
        )}

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
