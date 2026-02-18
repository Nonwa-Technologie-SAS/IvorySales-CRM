import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produits et services",
  description: "Gérez les produits et services de votre entreprise.",
};

export default function ProductsServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
