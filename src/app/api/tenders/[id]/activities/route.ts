import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ACTIVITY_TYPES = ['NOTE', 'CALL', 'EMAIL', 'MEETING'] as const;

const createTenderActivitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  content: z.string().min(1),
  date: z.string().optional(),
});

async function requireTenderAccess(tenderId: string, user: { id: string; role: string; companyId: string }) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    select: {
      id: true,
      companyId: true,
      assignments: { select: { userId: true } },
    },
  });
  if (!tender || tender.companyId !== user.companyId) return { ok: false as const, status: 404, error: "Appel d'offre introuvable" };
  const isManagerOrAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';
  if (!isManagerOrAdmin) {
    const assigned = tender.assignments.some((a) => a.userId === user.id);
    if (!assigned) return { ok: false as const, status: 403, error: 'Accès refusé' };
  }
  return { ok: true as const };
}

/** GET /api/tenders/[id]/activities - Activités paginées pour un AO */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });

    const { id: tenderId } = await params;
    const access = await requireTenderAccess(tenderId, { id: user.id, role: user.role, companyId: user.companyId });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

    const url = new URL(req.url);
    const skipParam = url.searchParams.get('skip');
    const takeParam = url.searchParams.get('take');
    const filterTypeParam = url.searchParams.get('filterType');

    const skip = Number.isNaN(Number(skipParam)) ? 0 : Math.max(0, Number(skipParam));
    const takeRaw = Number.isNaN(Number(takeParam)) ? 20 : Number(takeParam);
    const take = Math.min(Math.max(takeRaw, 1), 100);

    const where: {
      tenderId: string;
      type?: (typeof ACTIVITY_TYPES)[number];
    } = { tenderId };

    if (filterTypeParam && filterTypeParam !== 'ALL') {
      if ((ACTIVITY_TYPES as readonly string[]).includes(filterTypeParam)) {
        where.type = filterTypeParam as (typeof ACTIVITY_TYPES)[number];
      }
    }

    const [activities, total] = await Promise.all([
      prisma.tenderActivity.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take,
        include: { user: { select: { name: true } } },
      }),
      prisma.tenderActivity.count({ where }),
    ]);

    const hasMore = total > skip + activities.length;
    return NextResponse.json({ activities, total, hasMore });
  } catch (error) {
    console.error('GET /api/tenders/[id]/activities error', error);
    return NextResponse.json(
      { error: "Impossible de récupérer les activités de l'appel d'offre" },
      { status: 500 },
    );
  }
}

/** POST /api/tenders/[id]/activities - Ajoute une activité sur un AO */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });

    const { id: tenderId } = await params;
    const access = await requireTenderAccess(tenderId, { id: user.id, role: user.role, companyId: user.companyId });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

    const json = await req.json();
    const body = createTenderActivitySchema.parse(json);

    const activity = await prisma.tenderActivity.create({
      data: {
        type: body.type,
        tenderId,
        userId: user.id,
        content: body.content.trim(),
        date: body.date ? new Date(body.date) : undefined,
      },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }
    console.error('POST /api/tenders/[id]/activities error', error);
    return NextResponse.json(
      { error: "Impossible d'ajouter l'activité" },
      { status: 500 },
    );
  }
}

