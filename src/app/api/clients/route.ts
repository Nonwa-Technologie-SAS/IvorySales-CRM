import { getCurrentUser } from "@/lib/auth";
import { CONVERT_REQUIRES_PIVOT_INTERESTS_MESSAGE } from "@/lib/lead-conversion";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const convertLeadSchema = z.object({
  leadId: z.string().min(1),
});

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        company: true,
        convertedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 },
      );
    }

    const json = await req.json();
    const { leadId } = convertLeadSchema.parse(json);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        company: true,
        productInterests: { select: { productId: true, estimatedValue: true } },
        serviceInterests: { select: { serviceId: true, estimatedValue: true } },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead introuvable" },
        { status: 404 },
      );
    }

    if (
      lead.productInterests.length === 0 &&
      lead.serviceInterests.length === 0
    ) {
      return NextResponse.json(
        { error: CONVERT_REQUIRES_PIVOT_INTERESTS_MESSAGE },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx: PrismaTx) => {
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
          convertedById: user.id,
          convertedAt: new Date(),
        },
      });

      // Si des produits / services étaient déjà renseignés sur le lead,
      // on les initialise comme intérêts du client avec une valeur estimative issue du lead.
      const hasClientProductInterest =
        (tx as any).clientProductInterest !== undefined;
      const hasClientServiceInterest =
        (tx as any).clientServiceInterest !== undefined;

      const productInterestsSource = lead.productInterests.map((i) => ({
        productId: i.productId,
        estimatedValue: i.estimatedValue,
      }));

      const serviceInterestsSource = lead.serviceInterests.map((i) => ({
        serviceId: i.serviceId,
        estimatedValue: i.estimatedValue,
      }));

      if (hasClientProductInterest && productInterestsSource.length > 0) {
        await (tx as any).clientProductInterest.createMany({
          data: productInterestsSource.map((product) => ({
            clientId: client.id,
            productId: product.productId,
            estimatedValue: product.estimatedValue,
          })),
        });
      }

      if (hasClientServiceInterest && serviceInterestsSource.length > 0) {
        await (tx as any).clientServiceInterest.createMany({
          data: serviceInterestsSource.map((service) => ({
            clientId: client.id,
            serviceId: service.serviceId,
            estimatedValue: service.estimatedValue,
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
        { error: error.issues.map((e) => e.message).join(", ") },
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

