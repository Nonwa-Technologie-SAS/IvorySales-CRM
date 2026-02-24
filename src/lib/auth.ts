import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type Role = "ADMIN" | "MANAGER" | "AGENT";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId: string | null;
}

/**
 * Récupère l'utilisateur connecté à partir du cookie de session.
 * Retourne null si non authentifié ou utilisateur introuvable.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_session")?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, companyId: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    companyId: user.companyId,
  };
}

/**
 * Vérifie si l'utilisateur a l'un des rôles autorisés.
 */
export function hasRole(user: AuthUser | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Vérifie l'authentification et le rôle côté API.
 * Retourne une NextResponse 401 si non authentifié, 403 si rôle insuffisant.
 * Sinon retourne null (l'appelant peut continuer).
 */
export async function requireRole(
  allowedRoles: Role[]
): Promise<{ user: AuthUser } | Response> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: "Accès refusé" },
      { status: 403 }
    );
  }
  return { user };
}
