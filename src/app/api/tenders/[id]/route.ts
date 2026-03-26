import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateTenderSchema = z.object({
  title: z.string().min(1).optional(),
  reference: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  budget: z.number().nullable().optional(),
  apporteurId: z.string().nullable().optional(),
  assigneeIds: z.array(z.string().min(1)).optional(),
});

async function loadTenderForUser(id: string, user: { id: string; role: string; companyId: string }) {
  const tender = await prisma.tender.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      apporteur: { select: { id: true, name: true, email: true, role: true } },
      assignments: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      activities: {
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true } } },
      },
      attachments: {
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { id: true, name: true } } },
      },
    },
  });
  if (!tender || tender.companyId !== user.companyId) return { error: "Appel d'offre introuvable", status: 404 as const };
  if (user.role === 'AGENT' && !tender.assignments.some((a) => a.userId === user.id)) {
    return { error: 'Accès refusé', status: 403 as const };
  }
  return { tender };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });

    const { id } = await params;
    const result = await loadTenderForUser(id, { id: user.id, role: user.role, companyId: user.companyId });
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result.tender);
  } catch (error) {
    console.error('GET /api/tenders/[id] error', error);
    return NextResponse.json({ error: "Impossible de récupérer l'appel d'offre" }, { status: 500 });
  }
}

/** PATCH /api/tenders/[id] - MANAGER/ADMIN */
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
    const current = await prisma.tender.findUnique({ where: { id }, select: { id: true, companyId: true } });
    if (!current || current.companyId !== user.companyId) {
      return NextResponse.json({ error: "Appel d'offre introuvable" }, { status: 404 });
    }

    const body = updateTenderSchema.parse(await req.json());
    const assigneeIds = body.assigneeIds ? Array.from(new Set(body.assigneeIds)) : undefined;

    if (body.apporteurId) {
      const apporteur = await prisma.user.findFirst({
        where: { id: body.apporteurId, companyId: user.companyId },
        select: { id: true },
      });
      if (!apporteur) return NextResponse.json({ error: 'Apporteur invalide' }, { status: 400 });
    }

    if (assigneeIds && assigneeIds.length > 0) {
      const count = await prisma.user.count({
        where: { id: { in: assigneeIds }, companyId: user.companyId, role: 'AGENT' },
      });
      if (count !== assigneeIds.length) {
        return NextResponse.json({ error: 'Liste de commerciaux invalide' }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const tender = await tx.tender.update({
        where: { id },
        data: {
          ...(body.title !== undefined ? { title: body.title.trim() } : {}),
          ...(body.reference !== undefined ? { reference: body.reference?.trim() || null } : {}),
          ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
          ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
          ...(body.budget !== undefined ? { budget: body.budget } : {}),
          ...(body.apporteurId !== undefined ? { apporteurId: body.apporteurId } : {}),
        },
      });
      if (assigneeIds) {
        await tx.tenderAssignment.deleteMany({ where: { tenderId: id } });
        if (assigneeIds.length > 0) {
          await tx.tenderAssignment.createMany({
            data: assigneeIds.map((userId) => ({ tenderId: id, userId })),
          });
        }
      }
      return tender;
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }
    console.error('PATCH /api/tenders/[id] error', error);
    return NextResponse.json({ error: "Impossible de modifier l'appel d'offre" }, { status: 500 });
  }
}

