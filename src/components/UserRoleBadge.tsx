import type { FrontendRole } from "@/contexts/AuthContext";
import { getRoleLabel } from "@/lib/roles";
import clsx from "clsx";

interface UserRoleBadgeProps {
  role: FrontendRole;
}

export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium";

  const styles: Record<FrontendRole, string> = {
    admin: "bg-purple-100 text-purple-700",
    manager: "bg-amber-100 text-amber-700",
    directrice_commerciale: "bg-amber-100 text-amber-700",
    pdg: "bg-amber-100 text-amber-700",
    directrice_operation: "bg-amber-100 text-amber-700",
    agent: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={clsx(base, styles[role])}>{getRoleLabel(role)}</span>
  );
}
