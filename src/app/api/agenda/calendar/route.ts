import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/agenda/calendar?from=ISO&to=ISO[&userId=...]
 *
 * - AGENT  : ne voit que les tâches des leads qui lui sont assignés (lead.assignedTo = user.id)
 * - MANAGER / ADMIN :
 *    - par défaut : toutes les tâches de la société (lead.companyId = user.companyId)
 *    - si userId est fourni : uniquement les tâches des leads assignés à cet utilisateur
 */
export async function GET(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!authUser.companyId) {
      return NextResponse.json(
        { error: "Société introuvable pour cet utilisateur" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    const userIdFilter = url.searchParams.get("userId");

    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: "Paramètres from et to (ISO date) requis" },
        { status: 400 }
      );
    }

    const from = new Date(fromParam);
    const to = new Date(toParam);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return NextResponse.json(
        { error: "Dates from/to invalides" },
        { status: 400 }
      );
    }

    // Construction du where de base : société + plage de dates
    const where: Parameters<typeof prisma.agendaItem.findMany>[0]["where"] = {
      dueDate: { gte: from, lte: to },
      lead: {
        companyId: authUser.companyId,
      },
    };

    if (authUser.role === "AGENT") {
      // Un agent voit les leads qui lui sont assignés
      // ainsi que les leads non assignés (assignedTo = null),
      // afin que les tâches créées sur des leads importés/non affectés
      // apparaissent bien dans son agenda.
      where.lead = {
        ...where.lead,
        OR: [
          { assignedTo: authUser.id },
          { assignedTo: null },
        ],
      };
    } else if (userIdFilter) {
      // Manager / Admin : filtre optionnel par commercial
      const target = await prisma.user.findUnique({
        where: { id: userIdFilter },
        select: { companyId: true },
      });
      if (!target || target.companyId !== authUser.companyId) {
        return NextResponse.json(
          { error: "Utilisateur cible introuvable ou d'une autre société" },
          { status: 403 }
        );
      }
      where.lead = {
        ...where.lead,
        assignedTo: userIdFilter,
      };
    }

    const items = await prisma.agendaItem.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            assignedTo: true,
            company: { select: { name: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/agenda/calendar error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer le calendrier" },
      { status: 500 }
    );
  }
}
