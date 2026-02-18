"use client";

import { Field } from "@/components/ui/field";
import { withOfflineLayout } from "@/components/layouts/withOfflineLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function LoginPageInner() {
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
        // Si l'API renvoie un statut 4xx/5xx, on affiche le message d'erreur
        throw new Error(data.error || "Impossible de se connecter");
      }

      // À ce stade, les identifiants sont valides.
      // On pourrait stocker les infos utilisateur dans un contexte, Zustand, etc.
      // Pour l'instant on redirige simplement vers le dashboard.
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <h1 className="text-xl font-semibold text-primary">Connexion</h1>
        <p className="text-[11px] text-gray-500 mt-1">
          Accédez à votre espace CRM sécurisé.
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
        <Field
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="Votre mot de passe"
          required
        />

        {error && <p className="text-[11px] text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 px-4 py-2 rounded-full bg-primary text-white text-[11px] font-medium shadow-neu disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="flex flex-col gap-1 text-[11px] text-gray-500 mt-2">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Mot de passe oublié ?
        </Link>
        <span>
          Pas encore de compte ?
          <span className="ml-1 text-primary">Contactez l'administrateur.</span>
        </span>
      </div>
    </div>
  );
}

const LoginPage = withOfflineLayout(LoginPageInner);

export default LoginPage;
