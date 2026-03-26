import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT']).default('AGENT'),
  // optionnel côté API : on créera / utilisera une company par défaut si absent
  companyId: z.string().optional(),
});

const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT']).optional(),
});

/** GET : liste des utilisateurs — réservé à ADMIN et MANAGER (AGENT n'a pas accès). */
export async function GET() {
  const auth = await requireRole(['ADMIN', 'MANAGER']);
  if (auth instanceof Response) return auth;
  const { user: currentUser } = auth as {
    user: { id: string; role: 'ADMIN' | 'MANAGER' | 'AGENT'; companyId: string | null };
  };
  if (!currentUser.companyId) {
    return NextResponse.json(
      { error: 'Utilisateur sans entreprise' },
      { status: 403 },
    );
  }
  try {
    const users = await prisma.user.findMany({
      where: { companyId: currentUser.companyId },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users error', error);
    return NextResponse.json(
      { error: 'Unable to fetch users' },
      { status: 500 },
    );
  }
}

/** PATCH : modification d'un utilisateur (rôles, etc.) — ADMIN ou MANAGER. */
export async function PATCH(req: Request) {
  const auth = await requireRole(['ADMIN', 'MANAGER']);
  if (auth instanceof Response) return auth;
  const { user: currentUser } = auth as {
    user: { id: string; role: 'ADMIN' | 'MANAGER' | 'AGENT'; companyId: string | null };
  };
  if (!currentUser.companyId) {
    return NextResponse.json(
      { error: 'Utilisateur sans entreprise' },
      { status: 403 },
    );
  }
  try {
    const json = await req.json();
    const body = updateUserSchema.parse(json);

    const target = await prisma.user.findUnique({
      where: { id: body.id },
      select: { id: true, companyId: true },
    });
    if (!target || target.companyId !== currentUser.companyId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou autre entreprise' },
        { status: 403 },
      );
    }

    const user = await prisma.user.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('PATCH /api/users error', error);
    return NextResponse.json(
      { error: 'Unable to update user' },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

/** DELETE : suppression d'un utilisateur — ADMIN ou MANAGER. */
export async function DELETE(req: Request) {
  const auth = await requireRole(['ADMIN', 'MANAGER']);
  if (auth instanceof Response) return auth;
  const { user: currentUser } = auth as {
    user: { id: string; role: 'ADMIN' | 'MANAGER' | 'AGENT'; companyId: string | null };
  };
  if (!currentUser.companyId) {
    return NextResponse.json(
      { error: 'Utilisateur sans entreprise' },
      { status: 403 },
    );
  }
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, companyId: true },
    });
    if (!target || target.companyId !== currentUser.companyId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou autre entreprise' },
        { status: 403 },
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/users error', error);
    return NextResponse.json(
      { error: 'Unable to delete user' },
      { status: 500 },
    );
  }
}

/** POST : création d'un utilisateur — ADMIN ou MANAGER. */
export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN', 'MANAGER']);
  if (auth instanceof Response) return auth;
  const { user: currentUser } = auth as {
    user: { id: string; role: 'ADMIN' | 'MANAGER' | 'AGENT'; companyId: string | null };
  };
  if (!currentUser.companyId) {
    return NextResponse.json(
      { error: 'Utilisateur sans entreprise' },
      { status: 403 },
    );
  }
  try {
    const json = await req.json();
    const body = createUserSchema.parse(json);

    let companyId = currentUser.companyId;
    if (body.companyId && body.companyId !== currentUser.companyId) {
      return NextResponse.json(
        { error: 'Impossible de créer un utilisateur dans une autre entreprise' },
        { status: 403 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password, // ⚠️ à remplacer par un hash (bcrypt) en prod
        role: body.role,
        companyId,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error', error);
    return NextResponse.json(
      { error: 'Unable to create user' },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}
