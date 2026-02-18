import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads",
  description: "Gérez vos prospects et pipeline commercial.",
};

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
