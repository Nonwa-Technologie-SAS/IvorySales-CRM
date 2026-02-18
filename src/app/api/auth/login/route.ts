import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schéma de validation pour les identifiants reçus depuis le frontend
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email, password } = loginSchema.parse(json);

    // ⚠️ Pour l'instant on compare le mot de passe en clair.
    // En production, il faudra stocker un hash (bcrypt) et utiliser bcrypt.compare.
    const user = await prisma.user.findFirst({
      where: { email, password },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 },
      );
    }

    const res = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: { id: user.company.id, name: user.company.name },
    });

    // Cookie de session pour la protection des routes par le middleware
    res.cookies.set('auth_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données de connexion invalides' },
        { status: 400 },
      );
    }

    console.error('POST /api/auth/login error', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
