import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de board",
  description:
    "Vue d'ensemble CRM : prospects, taux de conversion, leads convertis et derniers prospects. Gérez vos leads, produits, services et clients.",
  openGraph: {
    title: "Tableau de board",
    description:
      "Vue d'ensemble CRM : prospects, taux de conversion et pipeline commercial.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
