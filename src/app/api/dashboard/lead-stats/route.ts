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

    // companyId est obligatoire dans le schéma Prisma.
    // On filtre donc strictement par société courante.
    const whereBase = user.companyId
      ? { companyId: user.companyId }
      : undefined;

    const [total, converted] = await Promise.all([
      prisma.lead.count({ where: whereBase ?? {} }),
      prisma.lead.count({
        where: whereBase
          ? { ...whereBase, status: "CONVERTED" }
          : { status: "CONVERTED" },
      }),
    ]);

    const conversionRate =
      total > 0 ? Math.round((converted / total) * 1000) / 10 : 0;

    return NextResponse.json({
      total,
      converted,
      conversionRate,
    });
  } catch (error) {
    console.error("GET /api/dashboard/lead-stats error", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
