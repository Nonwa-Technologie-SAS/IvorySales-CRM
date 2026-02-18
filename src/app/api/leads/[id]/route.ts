import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/leads/[id] - Récupère un lead avec sa société */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        company: true,
        activities: {
          orderBy: { date: "desc" },
          include: { user: { select: { name: true } } },
        },
        products: {
          select: { id: true, name: true },
        },
        services: {
          select: { id: true, name: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("GET /api/leads/[id] error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer le lead" },
      { status: 500 }
    );
  }
}
