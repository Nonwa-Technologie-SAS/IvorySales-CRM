import clsx from "clsx";

interface UserRoleBadgeProps {
  role: "admin" | "manager" | "directrice_commerciale" | "agent";
}

export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium";

  const styles: Record<UserRoleBadgeProps["role"], string> = {
    admin: "bg-purple-100 text-purple-700",
    manager: "bg-amber-100 text-amber-700",
    directrice_commerciale: "bg-amber-100 text-amber-700",
    agent: "bg-blue-100 text-blue-700",
  };

  const label =
    role === "admin"
      ? "Admin"
      : role === "manager"
        ? "Manager"
        : role === "directrice_commerciale"
          ? "Directrice commerciale"
          : "Commercial";

  return <span className={clsx(base, styles[role])}>{label}</span>;
}
