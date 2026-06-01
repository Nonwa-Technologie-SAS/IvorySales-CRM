import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasGroupCompanyScope } from "@/lib/group-scope-roles";
import { prisma } from "@/lib/prisma";

export type Role =
  | "ADMIN"
  | "MANAGER"
  | "DIRECTRICE_COMMERCIALE"
  | "PDG"
  | "DIRECTRICE_OPERATION"
  | "AGENT";

function effectiveRoleForPermissions(role: Role): Role {
  if (hasGroupCompanyScope(role)) return "MANAGER";
  return role;
}

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
  return allowedRoles.includes(effectiveRoleForPermissions(user.role));
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
  if (!allowedRoles.includes(effectiveRoleForPermissions(user.role))) {
    return NextResponse.json(
      { error: "Accès refusé" },
      { status: 403 }
    );
  }
  return { user };
}

/**
 * Périmètre entreprise pour rapports / objectifs : ADMIN & MANAGER restent sur leur société.
 * Rôles groupe (directrice, PDG, directrice opération) : sans companyId → société rattachée ;
 * avec companyId → entreprise ciblée si elle existe.
 */
export async function resolveGroupCompanyScope(
  user: AuthUser,
  companyIdParam: string | null,
): Promise<{ companyId: string } | NextResponse> {
  if (!user.companyId) {
    return NextResponse.json(
      { error: "Société non associée à l'utilisateur" },
      { status: 403 },
    );
  }
  if (!hasGroupCompanyScope(user.role)) {
    return { companyId: user.companyId };
  }
  const requested = companyIdParam?.trim() ?? "";
  if (!requested) {
    return { companyId: user.companyId };
  }
  const company = await prisma.company.findUnique({
    where: { id: requested },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json(
      { error: "Entreprise introuvable" },
      { status: 400 },
    );
  }
  return { companyId: company.id };
}
