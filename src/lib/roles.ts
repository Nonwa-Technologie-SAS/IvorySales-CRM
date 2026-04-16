import type { FrontendRole } from "@/contexts/AuthContext";

export function isManagerLike(role: FrontendRole | null | undefined): boolean {
  return role === "manager" || role === "directrice_commerciale";
}

export function isAdminOrManagerLike(role: FrontendRole | null | undefined): boolean {
  return role === "admin" || isManagerLike(role);
}

