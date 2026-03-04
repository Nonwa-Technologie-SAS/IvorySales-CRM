import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_STALE_DAYS = 7;

function isAuthorized(req: Request): boolean {
  const token = process.env.AUTOMATION_TOKEN;
  if (!token) {
    // En l'absence de token, on autorise en environnement non prod
    return process.env.NODE_ENV !== "production";
  }
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const provided = authHeader.slice("Bearer ".length).trim();
  return provided === token;
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days");
    const days = daysParam
      ? Number.parseInt(daysParam, 10)
      : DEFAULT_STALE_DAYS;
    const effectiveDays = Number.isFinite(days) && days > 0 ? days : DEFAULT_STALE_DAYS;

    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - effectiveDays);

    // Leads à relancer :
    // - statut NEW / CONTACTED / QUALIFIED
    // - dernière activité < cutoff OU aucune activité et createdAt < cutoff
    // - aucun AgendaItem TODO avec dueDate > now
    const leads = await prisma.lead.findMany({
      where: {
        status: { in: ["NEW", "CONTACTED", "QUALIFIED"] },
        AND: [
          {
            OR: [
              {
                // A au moins une activité, mais aucune récente
                activities: {
                  some: { date: { lt: cutoff } },
                },
                NOT: {
                  activities: {
                    some: {
                      date: {
                        gte: cutoff,
                      },
                    },
                  },
                },
              },
              {
                // Aucune activité et lead ancien
                activities: { none: {} },
                createdAt: { lt: cutoff },
              },
            ],
          },
          {
            // Pas déjà de tâche TODO planifiée dans le futur
            agendaItems: {
              none: {
                status: "TODO",
                dueDate: {
                  gt: now,
                },
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (leads.length === 0) {
      return NextResponse.json({ createdTasks: 0 });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const tasks = await prisma.$transaction(
      leads.map((lead: { id: string }) =>
        prisma.agendaItem.create({
          data: {
            leadId: lead.id,
            title: "Relancer le prospect",
            dueDate,
            status: "TODO",
          },
        }),
      ),
    );

    return NextResponse.json({ createdTasks: tasks.length });
  } catch (error) {
    console.error("POST /api/automation/remind-stale-leads error", error);
    return NextResponse.json(
      { error: "Impossible de créer les tâches de relance" },
      { status: 500 },
    );
  }
}

