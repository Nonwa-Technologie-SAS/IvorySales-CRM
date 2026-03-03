import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
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
      "Reçu par",
      "Observation",
      "Civilité",
      "Email",
      "Nom",
      "Prenoms",
    ];

    const rows = leads.map((lead) => [
      lead.activityDomain ?? "",
      lead.companyName ?? "",
      lead.phone ?? "",
      lead.location ?? "",
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

