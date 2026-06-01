import type { FrontendRole } from "@/contexts/AuthContext";

export const GROUP_SCOPE_FRONTEND_ROLES = [
  "directrice_commerciale",
  "pdg",
  "directrice_operation",
] as const satisfies readonly FrontendRole[];

/** Rôles avec accès navigation / pages équivalent directrice (stats, users, filtre entreprise). */
export const GROUP_NAV_ROLES = [
  "admin",
  "manager",
  ...GROUP_SCOPE_FRONTEND_ROLES,
] as const satisfies readonly FrontendRole[];

const FRONTEND_ROLE_MAP: Record<string, FrontendRole> = {
  admin: "admin",
  manager: "manager",
  agent: "agent",
  directrice_commerciale: "directrice_commerciale",
  pdg: "pdg",
  directrice_operation: "directrice_operation",
};

export function normalizeFrontendRole(raw: string | undefined | null): FrontendRole {
  const key = (raw ?? "agent").toLowerCase().replace(/-/g, "_");
  return FRONTEND_ROLE_MAP[key] ?? "agent";
}

export function hasGroupCompanyScopeFrontend(
  role: FrontendRole | null | undefined,
): boolean {
  if (!role) return false;
  return (GROUP_SCOPE_FRONTEND_ROLES as readonly string[]).includes(role);
}

export function isManagerLike(role: FrontendRole | null | undefined): boolean {
  return role === "manager" || hasGroupCompanyScopeFrontend(role);
}

export function isAdminOrManagerLike(
  role: FrontendRole | null | undefined,
): boolean {
  return role === "admin" || isManagerLike(role);
}

/** Options pour les formulaires de création / édition d’utilisateur. */
export const USER_ROLE_FORM_OPTIONS: ReadonlyArray<
  readonly [FrontendRole, string]
> = [
  ["agent", "Commercial"],
  ["manager", "Manager"],
  ["directrice_commerciale", "Directrice commerciale"],
  ["pdg", "PDG"],
  ["directrice_operation", "Directrice opération"],
  ["admin", "Admin"],
];

export const USER_ROLE_FILTER_OPTIONS: ReadonlyArray<
  readonly [FrontendRole | "all", string]
> = [["all", "Tous"], ...USER_ROLE_FORM_OPTIONS];

export function frontendRoleToApi(role: FrontendRole): string {
  return role.toUpperCase();
}

export function getRoleLabel(role: FrontendRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "manager":
      return "Manager";
    case "directrice_commerciale":
      return "Directrice commerciale";
    case "pdg":
      return "PDG";
    case "directrice_operation":
      return "Directrice opération";
    default:
      return "Commercial";
  }
}
