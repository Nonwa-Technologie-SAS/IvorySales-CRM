import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const whereBase = user.companyId
      ? { companyId: user.companyId }
      : undefined;

    const rows = await prisma.lead.findMany({
      where: whereBase ?? {},
      select: { source: true },
    });

    return NextResponse.json(
      rows.map((r) => ({ source: r.source ?? null })),
    );
  } catch (error) {
    console.error("GET /api/dashboard/lead-source-distribution error", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
