import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const convertLeadSchema = z.object({
  leadId: z.string().min(1),
});

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        company: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/clients error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les clients" },
      { status: 500 },
    );
  }
}

// Convertit un lead en client à partir de son id
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { leadId } = convertLeadSchema.parse(json);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        company: true,
        products: true,
        services: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead introuvable" },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name: `${lead.firstName} ${lead.lastName}`.trim(),
          contact: lead.phone || lead.email || undefined,
          email: lead.email || undefined,
          phone: lead.phone || undefined,
          source: lead.source || undefined,
          civility: lead.civility || undefined,
          activityDomain: lead.activityDomain || undefined,
          companyName: lead.companyName ?? lead.company?.name,
          location: lead.location || undefined,
          notes: lead.notes || undefined,
          companyId: lead.companyId,
        },
      });

      // Si des produits / services étaient déjà renseignés sur le lead,
      // on les initialise comme intérêts du client avec une valeur estimative à 0.
      const hasClientProductInterest =
        (tx as any).clientProductInterest !== undefined;
      const hasClientServiceInterest =
        (tx as any).clientServiceInterest !== undefined;

      if (hasClientProductInterest && lead.products.length > 0) {
        await (tx as any).clientProductInterest.createMany({
          data: lead.products.map((product) => ({
            clientId: client.id,
            productId: product.id,
            estimatedValue: 0,
          })),
        });
      }

      if (hasClientServiceInterest && lead.services.length > 0) {
        await (tx as any).clientServiceInterest.createMany({
          data: lead.services.map((service) => ({
            clientId: client.id,
            serviceId: service.id,
            estimatedValue: 0,
          })),
        });
      }

      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: { status: "CONVERTED" },
      });

      return { client, lead: updatedLead };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }
    console.error("POST /api/clients error", error);
    return NextResponse.json(
      { error: "Impossible de convertir le lead en client" },
      { status: 500 },
    );
  }
}

