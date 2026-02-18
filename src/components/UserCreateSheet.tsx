"use client";

import { useState, type FormEvent } from "react";
import NeumoCard from "./NeumoCard";
import UserRoleBadge from "./UserRoleBadge";

interface UserCreateSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "manager" | "agent";
  }) => void;
}

export default function UserCreateSheet({
  open,
  onClose,
  onCreated,
}: UserCreateSheetProps) {
  const [role, setRole] = useState<"admin" | "manager" | "agent">("agent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role.toUpperCase(), // API attend ADMIN | MANAGER | AGENT
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Impossible de créer l'utilisateur");
      }

      const created = await res.json();
      onCreated?.({
        id: created.id,
        name: created.name,
        email: created.email,
        role,
      });

      form.reset();
      setRole("agent");
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-transparent p-4" onClick={onClose}>
        <div
          className="h-full"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <NeumoCard className="h-full bg-white p-5 flex flex-col gap-4 shadow-neu-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-primary">Ajouter un utilisateur</h2>
                <p className="text-[11px] text-gray-500">Créez un nouveau compte pour votre équipe.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs text-gray-700">
              <label className="flex flex-col gap-1">
                <span>Nom complet</span>
                <input
                  name="name"
                  className="h-8 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="Ex: Awa Koné"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  className="h-8 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="awa@example.com"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Mot de passe provisoire</span>
                <input
                  type="password"
                  name="password"
                  className="h-8 rounded-xl border border-gray-200 px-3 text-[11px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="Min. 6 caractères"
                  required
                />
              </label>

              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[11px] text-gray-500">Rôle</span>
                <div className="flex gap-2">
                  {([
                    ["agent", "Commercial"],
                    ["manager", "Manager"],
                    ["admin", "Admin"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`px-3 py-1 rounded-full border text-[11px] transition-colors ${
                        role === value
                          ? "bg-primary text-white border-primary shadow-neu"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/40"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-gray-400">
                  Récapitulatif: <UserRoleBadge role={role} />
                </div>
              </div>

              {error && (
                <p className="text-[11px] text-rose-500 mt-1">{error}</p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-full text-[11px] bg-gray-100 text-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-full text-[11px] bg-primary text-white shadow-neu disabled:opacity-60"
                >
                  {loading ? "En cours..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </NeumoCard>
        </div>
      </div>
    </div>
  );
}
