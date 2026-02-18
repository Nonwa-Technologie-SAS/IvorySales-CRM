"use client";

import { useState, type FormEvent } from "react";
import NeumoCard from "@/components/NeumoCard";
import { Field } from "@/components/ui/field";
import { withDashboardLayout } from "@/components/layouts/withDashboardLayout";
import { useRouter } from "next/navigation";

function NewCompanyPageInner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get("companyName") ?? "").trim();
    const plan = (fd.get("plan") as string) || "free";
    const userName = String(fd.get("managerName") ?? "").trim();
    const email = String(fd.get("managerEmail") ?? "").trim();
    const password = String(fd.get("managerPassword") ?? "");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          plan,
          firstUser: { name: userName, email, password },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Impossible de créer l'entreprise");
      }

      form.reset();
      router.push("/users");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="mt-2">
        <h1 className="text-xl md:text-2xl font-semibold text-primary">
          Créer une entreprise
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Ajoutez une nouvelle entreprise et son premier utilisateur (manager).
        </p>
      </section>

      <NeumoCard className="mt-4 p-5 bg-white max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <h2 className="text-sm font-semibold text-primary mb-3">
              Informations de l'entreprise
            </h2>
            <div className="flex flex-col gap-3">
              <Field
                name="companyName"
                label="Nom de l'entreprise"
                placeholder="Ex: Cashora CRM SA"
                required
              />
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-600">Offre</span>
                <select
                  name="plan"
                  className="h-8 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  <option value="free">Gratuit</option>
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                </select>
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-primary mb-3">
              Premier utilisateur (Manager)
            </h2>
            <p className="text-[11px] text-gray-500 mb-3">
              Ce compte sera le manager de l'entreprise.
            </p>
            <div className="flex flex-col gap-3">
              <Field
                name="managerName"
                label="Nom complet"
                placeholder="Ex: David Robert"
                required
              />
              <Field
                name="managerEmail"
                type="email"
                label="Email"
                placeholder="david@entreprise.com"
                required
              />
              <Field
                name="managerPassword"
                type="password"
                label="Mot de passe"
                placeholder="Min. 6 caractères"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-rose-500">{error}</p>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-3 py-2 rounded-full text-[11px] bg-gray-100 text-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-full text-[11px] bg-primary text-white shadow-neu disabled:opacity-60"
            >
              {loading ? "Création..." : "Créer l'entreprise et le manager"}
            </button>
          </div>
        </form>
      </NeumoCard>
    </>
  );
}

const NewCompanyPage = withDashboardLayout(NewCompanyPageInner);

export default NewCompanyPage;
