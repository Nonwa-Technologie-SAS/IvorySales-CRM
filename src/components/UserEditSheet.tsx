"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/ui/field";
import UserRoleBadge from "@/components/UserRoleBadge";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface UserEditSheetProps {
  open: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "manager" | "agent";
  } | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: (user: { id: string; name: string; email: string; role: "admin" | "manager" | "agent" }) => void;
}

export function UserEditSheet({ open, user, onOpenChange, onUpdated }: UserEditSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "agent">("agent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quand on ouvre le sheet sur un nouvel utilisateur, on initialise le formulaire
  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setError(null);
    }
  }, [open, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name,
          email,
          role: role.toUpperCase(), // API attend ADMIN | MANAGER | AGENT
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Impossible de mettre à jour l'utilisateur");
      }

      onUpdated({ id: user.id, name, email, role });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex flex-col gap-1">
            <SheetTitle>Modifier l'utilisateur</SheetTitle>
            <SheetDescription>
              Mettez à jour les informations de ce membre de l'équipe.
            </SheetDescription>
          </div>
          <SheetClose className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center">
            ✕
          </SheetClose>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 text-xs">
          <Field
            label="Nom complet"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

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

          {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}

          <div className="mt-4 flex justify-end gap-2">
            <SheetClose className="px-3 py-1.5 rounded-full text-[11px] bg-gray-100 text-gray-600">
              Annuler
            </SheetClose>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-full text-[11px] bg-primary text-white shadow-neu disabled:opacity-60"
            >
              {loading ? "En cours..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
