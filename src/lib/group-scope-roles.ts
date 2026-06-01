/** Rôles avec vision multi-entreprises (même périmètre que la directrice commerciale). */
export const GROUP_SCOPE_ROLES = [
  "DIRECTRICE_COMMERCIALE",
  "PDG",
  "DIRECTRICE_OPERATION",
] as const;

export type GroupScopeRole = (typeof GROUP_SCOPE_ROLES)[number];

export function hasGroupCompanyScope(role: string): boolean {
  return (GROUP_SCOPE_ROLES as readonly string[]).includes(role);
}
