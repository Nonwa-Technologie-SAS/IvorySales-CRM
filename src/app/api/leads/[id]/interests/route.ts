import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const interestsPayloadSchema = z.object({
  items: z.array(
    z.object({
      kind: z.enum(['product', 'service']),
      id: z.string().min(1),
      estimatedValue: z.number().min(0),
    }),
  ),
});

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** PUT /api/leads/[id]/interests - Remplace les intérêts (produits/services) d'un lead avec estimation */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: leadId } = await params;
    const json = await req.json();
    const body = interestsPayloadSchema.parse(json);

    const productItems = body.items
      .filter((i) => i.kind === 'product')
      .map((i) => ({ productId: i.id, estimatedValue: i.estimatedValue }));
    const serviceItems = body.items
      .filter((i) => i.kind === 'service')
      .map((i) => ({ serviceId: i.id, estimatedValue: i.estimatedValue }));

    const result = await prisma.$transaction(async (tx: PrismaTx) => {
      const leadExists = await tx.lead.findUnique({
        where: { id: leadId },
        select: { id: true },
      });
      if (!leadExists) {
        return { notFound: true as const };
      }

      await tx.leadProductInterest.deleteMany({ where: { leadId } });
      await tx.leadServiceInterest.deleteMany({ where: { leadId } });

      if (productItems.length > 0) {
        await tx.leadProductInterest.createMany({
          data: productItems.map((p) => ({
            leadId,
            productId: p.productId,
            estimatedValue: p.estimatedValue,
          })),
        });
      }
      if (serviceItems.length > 0) {
        await tx.leadServiceInterest.createMany({
          data: serviceItems.map((s) => ({
            leadId,
            serviceId: s.serviceId,
            estimatedValue: s.estimatedValue,
          })),
        });
      }

      return {
        notFound: false as const,
        counts: { products: productItems.length, services: serviceItems.length },
      };
    });

    if (result.notFound) {
      return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Intérêts enregistrés avec succès.',
      counts: result.counts,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }
    console.error('PUT /api/leads/[id]/interests error', error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer les intérêts" },
      { status: 500 },
    );
  }
}

