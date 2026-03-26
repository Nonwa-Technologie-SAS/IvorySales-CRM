import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'PUBLISHED',
    'IN_PROGRESS',
    'SUBMITTED',
    'WON',
    'LOST',
    'CANCELLED',
  ]),
});

/** PATCH /api/tenders/[id]/status - MANAGER/ADMIN */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });
    if (user.role === 'AGENT') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const { id } = await params;
    const { status } = statusSchema.parse(await req.json());

    const tender = await prisma.tender.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });
    if (!tender || tender.companyId !== user.companyId) {
      return NextResponse.json({ error: "Appel d'offre introuvable" }, { status: 404 });
    }

    const updated = await prisma.tender.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }
    console.error('PATCH /api/tenders/[id]/status error', error);
    return NextResponse.json({ error: 'Impossible de changer le statut' }, { status: 500 });
  }
}

