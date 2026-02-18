import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients",
  description: "Liste et gestion de vos clients.",
};

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}