import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { getCurrentUser } from "@/lib/auth";
import { getLegacyUnassignedLeadIdsForAgent } from "@/lib/agentLegacyLeadAccess";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!user.companyId) {
      return NextResponse.json(
        { error: "Aucune société associée à l'utilisateur" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const companyIdParam = url.searchParams.get("companyId");
    let effectiveCompanyId = user.companyId;
    if (user.role === "DIRECTRICE_COMMERCIALE" && companyIdParam) {
      const exists = await prisma.company.findUnique({
        where: { id: companyIdParam },
        select: { id: true },
      });
      if (!exists) {
        return NextResponse.json({ error: "Entreprise introuvable" }, { status: 400 });
      }
      effectiveCompanyId = companyIdParam;
    }

    const where: any = {
      companyId: effectiveCompanyId,
    };
    // Legacy transition: aligné sur GET /api/leads (première activité de création/import = proxy créateur).
    if (user.role === "AGENT") {
      const legacyIds = await getLegacyUnassignedLeadIdsForAgent(
        effectiveCompanyId,
        user.id,
      );
      where.OR = [
        { assignedTo: user.id },
        ...(legacyIds.length ? [{ id: { in: legacyIds } }] : []),
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        source: true,
        status: true,
        companyName: true,
        jobTitle: true,
        activityDomain: true,
        location: true,
        createdAt: true,
        civility: true,
        assignedTo: true,
        notes: true,
      },
    });

    const headerRow = [
      "Domaine d'activités",
      "Nom de l'entreprise",
      "Contact",
      "Situation géographique",
      "Poste / Fonction",
      "Reçu par",
      "Observation",
      "Civilité",
      "Email",
      "Nom",
      "Prenoms",
    ];

    type LeadRow = { id: string; firstName: string; lastName: string; email: string | null; phone: string | null; source: string | null; status: string; companyName: string | null; jobTitle: string | null; activityDomain: string | null; location: string | null; createdAt: Date; civility: string | null; assignedTo: string | null; notes: string | null };
    const rows = leads.map((lead: LeadRow) => [
      lead.activityDomain ?? "",
      lead.companyName ?? "",
      lead.phone ?? "",
      lead.location ?? "",
      lead.jobTitle ?? "",
      lead.assignedTo ?? "",
      lead.notes ?? lead.source ?? "",
      lead.civility ?? "",
      lead.email ?? "",
      lead.firstName,
      lead.lastName,
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dateStr = new Date().toISOString().slice(0, 10);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="leads-${dateStr}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("GET /api/leads/export error", error);
    return NextResponse.json(
      { error: "Impossible d'exporter les leads" },
      { status: 500 }
    );
  }
}

