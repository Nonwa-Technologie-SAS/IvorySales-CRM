import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Statistiques et tableaux de bord de KpiTracker.",
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
