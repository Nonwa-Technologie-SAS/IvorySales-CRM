"use client";

import { Field } from "@/components/ui/field";
import { withOfflineLayout } from "@/components/layouts/withOfflineLayout";
import Link from "next/link";
import { useState, type FormEvent } from "react";

function ForgotPasswordPageInner() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // TODO: appeler API d'envoi de lien de réinitialisation
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <h1 className="text-xl font-semibold text-primary">Mot de passe oublié</h1>
        <p className="text-[11px] text-gray-500 mt-1">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
        <Field
          name="email"
          type="email"
          label="Email"
          placeholder="vous@entreprise.com"
          required
        />

        {sent && (
          <p className="text-[11px] text-emerald-600">
            Si un compte existe pour cet email, un lien vient d'être envoyé.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 px-4 py-2 rounded-full bg-primary text-white text-[11px] font-medium shadow-neu disabled:opacity-60"
        >
          {loading ? "Envoi..." : "Envoyer le lien"}
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

const ForgotPasswordPage = withOfflineLayout(ForgotPasswordPageInner);

export default ForgotPasswordPage;
