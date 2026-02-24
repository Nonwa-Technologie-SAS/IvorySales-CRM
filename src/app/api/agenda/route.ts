import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const agendaStatusValues = ["TODO", "IN_PROGRESS", "DONE"] as const;

const createAgendaSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().min(1),
  status: z.enum(agendaStatusValues).optional(),
});

/** GET /api/agenda?leadId=xxx - Liste les tâches/événements agenda d'un lead */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const leadId = url.searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json({ error: "leadId requis" }, { status: 400 });
    }

    const items = await prisma.agendaItem.findMany({
      where: { leadId },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/agenda error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer l'agenda" },
      { status: 500 },
    );
  }
}

/** POST /api/agenda - Crée une tâche/événement agenda */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = createAgendaSchema.parse(json);

    const lead = await prisma.lead.findUnique({
      where: { id: body.leadId },
      select: { id: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
    }

    const item = await prisma.agendaItem.create({
      data: {
        leadId: body.leadId,
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
        status: body.status ?? "TODO",
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/agenda error", error);
    return NextResponse.json(
      { error: "Impossible de créer l'élément d'agenda" },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

