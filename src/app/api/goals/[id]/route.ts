import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateGoalSchema = z.object({
  targetConversions: z.number().int().min(0).optional(),
  targetRevenue: z.number().min(0).optional(),
});

/** PATCH : modifier un objectif — ADMIN ou MANAGER, même company. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(['ADMIN', 'MANAGER']);
  if (auth instanceof Response) return auth;
  const { user } = auth;
  if (!user.companyId) {
    return NextResponse.json(
      { error: 'Utilisateur sans entreprise' },
      { status: 403 },
    );
  }
  try {
    const { id } = await params;
    const existing = await prisma.salesGoal.findUnique({
      where: { id },
      select: { companyId: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Objectif introuvable' },
        { status: 404 },
      );
    }
    if (existing.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const json = await req.json();
    const body = updateGoalSchema.parse(json);

    const goal = await prisma.salesGoal.update({
      where: { id },
      data: {
        ...(body.targetConversions !== undefined && {
          targetConversions: body.targetConversions,
        }),
        ...(body.targetRevenue !== undefined && {
          targetRevenue: body.targetRevenue,
        }),
        setById: user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        setBy: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(goal);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.issues.map((err) => err.message).join(' ; ') },
        { status: 400 },
      );
    }
    console.error('PATCH /api/goals/[id] error', e);
    return NextResponse.json(
      { error: "Impossible de modifier l'objectif" },
      { status: 500 },
    );
  }
}

/** DELETE : supprimer un objectif — ADMIN ou MANAGER, même company. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(['ADMIN', 'MANAGER']);
  if (auth instanceof Response) return auth;
  const { user } = auth;
  if (!user.companyId) {
    return NextResponse.json(
      { error: 'Utilisateur sans entreprise' },
      { status: 403 },
    );
  }
  try {
    const { id } = await params;
    const existing = await prisma.salesGoal.findUnique({
      where: { id },
      select: { companyId: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Objectif introuvable' },
        { status: 404 },
      );
    }
    if (existing.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await prisma.salesGoal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/goals/[id] error', error);
    return NextResponse.json(
      { error: "Impossible de supprimer l'objectif" },
      { status: 500 },
    );
  }
}
