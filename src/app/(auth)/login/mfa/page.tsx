"use client";

import { withOfflineLayout } from "@/components/layouts/withOfflineLayout";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Smartphone } from "lucide-react";

function LoginMfaPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [pending, setPending] = useState<boolean | null>(null);
  const [emailMasked, setEmailMasked] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/mfa/status")
      .then((res) => res.json())
      .then((data) => {
        setPending(data.pending === true);
        if (data.emailMasked) setEmailMasked(data.emailMasked);
      })
      .catch(() => setPending(false));
  }, []);

  useEffect(() => {
    if (pending === false) {
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("from", from);
      router.replace(loginUrl.pathname + "?" + loginUrl.searchParams.toString());
    }
  }, [pending, from, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = code.replace(/\D/g, "").slice(0, 6);
    if (trimmed.length !== 6) {
      setError("Saisissez un code à 6 chiffres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/mfa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Code invalide ou expiré.");
        return;
      }

      router.replace(from);
    } catch {
      setError("Erreur lors de la vérification.");
    } finally {
      setLoading(false);
    }
  };

  if (pending === null) {
    return (
      <div className="flex flex-col gap-4 text-xs">
        <p className="text-gray-500">Vérification en cours…</p>
      </div>
    );
  }

  if (pending === false) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div className="flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-semibold text-primary">
          Vérification en deux étapes
        </h1>
      </div>
      <p className="text-[11px] text-gray-500">
        Entrez le code à 6 chiffres généré par votre application d&apos;authentification
        {emailMasked ? ` pour ${emailMasked}` : ""}.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="mfa-code" className="text-[11px] text-gray-500 font-medium">
            Code à 6 chiffres
          </label>
          <input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError(null);
            }}
            className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm tracking-[0.3em] font-mono outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
        </div>

        {error && <p className="text-[11px] text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="mt-1 px-4 py-2 rounded-full bg-primary text-white text-[11px] font-medium shadow-neu disabled:opacity-60"
        >
          {loading ? "Vérification…" : "Valider"}
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

const LoginMfaPage = withOfflineLayout(LoginMfaPageInner);

export default LoginMfaPage;
