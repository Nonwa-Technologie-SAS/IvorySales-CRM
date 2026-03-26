import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const tenderStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'IN_PROGRESS',
  'SUBMITTED',
  'WON',
  'LOST',
  'CANCELLED',
]);

const createTenderSchema = z.object({
  title: z.string().min(1),
  reference: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  budget: z.number().optional(),
  apporteurId: z.string().optional(),
  assigneeIds: z.array(z.string().min(1)).default([]),
});

/** GET /api/tenders?status=&search=
 * AGENT: uniquement assignés
 * MANAGER/ADMIN: tous de la société
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) {
      return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search')?.trim();
    const assigneeId = url.searchParams.get('assigneeId');

    const whereBase = {
      companyId: user.companyId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { reference: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(user.role === 'AGENT'
        ? { assignments: { some: { userId: user.id } } }
        : assigneeId
          ? { assignments: { some: { userId: assigneeId } } }
          : {}),
    };

    const statusFilter =
      status && tenderStatusSchema.safeParse(status).success
        ? ({ status: status as z.infer<typeof tenderStatusSchema> } as const)
        : {};

    let tenders;
    try {
      tenders = await prisma.tender.findMany({
        where: { ...whereBase, ...statusFilter },
        orderBy: { createdAt: 'desc' },
        include: {
          apporteur: { select: { id: true, name: true, role: true, email: true } },
          assignments: {
            include: { user: { select: { id: true, name: true, role: true, email: true } } },
          },
        },
      });
    } catch (err) {
      const msg = String((err as { message?: string } | null)?.message ?? '');
      // Compatibilité process stale Prisma Client: on retire le filtre status au lieu d'un 500.
      if (!/Invalid value for argument `status`/i.test(msg)) throw err;
      tenders = await prisma.tender.findMany({
        where: whereBase,
        orderBy: { createdAt: 'desc' },
        include: {
          apporteur: { select: { id: true, name: true, role: true, email: true } },
          assignments: {
            include: { user: { select: { id: true, name: true, role: true, email: true } } },
          },
        },
      });
    }

    return NextResponse.json(tenders);
  } catch (error) {
    console.error('GET /api/tenders error', error);
    return NextResponse.json({ error: "Impossible de récupérer les appels d'offre" }, { status: 500 });
  }
}

/** POST /api/tenders - MANAGER/ADMIN uniquement */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });
    if (user.role === 'AGENT') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const json = await req.json();
    const body = createTenderSchema.parse(json);
    const assigneeIds = Array.from(new Set(body.assigneeIds));

    if (body.apporteurId) {
      const apporteur = await prisma.user.findFirst({
        where: { id: body.apporteurId, companyId: user.companyId },
        select: { id: true },
      });
      if (!apporteur) {
        return NextResponse.json({ error: 'Apporteur invalide' }, { status: 400 });
      }
    }

    if (assigneeIds.length > 0) {
      const count = await prisma.user.count({
        where: { id: { in: assigneeIds }, companyId: user.companyId, role: 'AGENT' },
      });
      if (count !== assigneeIds.length) {
        return NextResponse.json(
          { error: 'Les commerciaux affectés doivent être des AGENTs de la société' },
          { status: 400 },
        );
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const tender = await tx.tender.create({
        data: {
          title: body.title.trim(),
          reference: body.reference?.trim() || undefined,
          description: body.description?.trim() || undefined,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          budget: typeof body.budget === 'number' ? body.budget : undefined,
          ...(body.apporteurId
            ? { apporteur: { connect: { id: body.apporteurId } } }
            : {}),
          company: { connect: { id: user.companyId! } },
          createdBy: { connect: { id: user.id } },
        },
      });
      if (assigneeIds.length > 0) {
        await tx.tenderAssignment.createMany({
          data: assigneeIds.map((id) => ({ tenderId: tender.id, userId: id })),
          skipDuplicates: true,
        });
      }
      return tender;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }
    console.error('POST /api/tenders error', error);
    return NextResponse.json({ error: "Impossible de créer l'appel d'offre" }, { status: 500 });
  }
}

