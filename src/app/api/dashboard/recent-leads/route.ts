import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RECENT_LEADS_LIMIT = 15;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Même périmètre que les KPIs dashboard (filtre société stricte).
    const whereClause = user.companyId
      ? { companyId: user.companyId }
      : undefined;

    const leads = await prisma.lead.findMany({
      where: whereClause ?? {},
      orderBy: { createdAt: "desc" },
      take: RECENT_LEADS_LIMIT,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    const result = leads.map((l) => ({
      id: l.id,
      firstName: l.firstName,
      lastName: l.lastName,
      email: l.email ?? null,
      phone: l.phone ?? null,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/dashboard/recent-leads error", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
