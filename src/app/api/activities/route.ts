import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ACTIVITY_TYPES = ["CALL", "EMAIL", "WHATSAPP", "MEETING", "NOTE"] as const;

const createActivitySchema = z.object({
  leadId: z.string().min(1),
  type: z.enum(ACTIVITY_TYPES),
  content: z.string().min(1),
  // Optionnel : pour les rendez-vous, permet de fixer la date/heure
  // On accepte ici n'importe quelle chaîne (ex: valeur de <input type=\"datetime-local\" />)
  // et on la convertit ensuite en Date côté serveur.
  date: z.string().optional(),
});

/** GET /api/activities?leadId=xxx - Liste les activités d'un lead */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const leadId = url.searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json({ error: "leadId requis" }, { status: 400 });
    }

    const activities = await prisma.activity.findMany({
      where: { leadId },
      orderBy: { date: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET /api/activities error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les activités" },
      { status: 500 }
    );
  }
}

/** POST /api/activities - Crée une interaction */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = createActivitySchema.parse(json);

    const lead = await prisma.lead.findUnique({
      where: { id: body.leadId },
      include: { company: { include: { users: { take: 1 } } } },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
    }

    const firstUser = await prisma.user.findFirst();
    const userId = lead.company.users[0]?.id ?? firstUser?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Aucun utilisateur dans la société pour enregistrer l'activité" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        type: body.type,
        relatedTo: "LEAD",
        leadId: body.leadId,
        userId,
        content: body.content,
        // si une date est fournie (ex. pour un rendez-vous), on l'utilise
        date: body.date ? new Date(body.date) : undefined,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error", error);
    return NextResponse.json(
      { error: "Impossible de créer l'activité" },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
