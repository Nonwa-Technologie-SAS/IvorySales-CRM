"use client";

import { useEffect, useState } from "react";
import NeumoCard from "@/components/NeumoCard";
import { withDashboardLayout } from "@/components/layouts/withDashboardLayout";

function ProfilePageInner() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    company?: { name: string };
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data ?? null))
      .catch(() => setUser(null));
  }, []);

  return (
    <>
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-primary">Mon profil</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Vos informations personnelles et préférences de compte.
          </p>
        </div>
      </section>

      <NeumoCard className="mt-4 p-4 bg-white flex flex-col gap-4 max-w-md">
        <h2 className="text-sm font-semibold text-primary">Informations du compte</h2>
        {user ? (
          <div className="flex flex-col gap-2 text-xs text-gray-600">
            <p><span className="text-gray-500">Nom :</span> {user.name}</p>
            <p><span className="text-gray-500">Email :</span> {user.email}</p>
            <p><span className="text-gray-500">Rôle :</span> {user.role}</p>
            {user.company && (
              <p><span className="text-gray-500">Entreprise :</span> {user.company.name}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Chargement...</p>
        )}
      </NeumoCard>
    </>
  );
}

const ProfilePage = withDashboardLayout(ProfilePageInner);
export default ProfilePage;
