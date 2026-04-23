import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
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

    const user = await prisma.user.findFirst({
      where: { email },
      include: { company: true },
    });

    const validPassword = user
      ? await verifyPassword(password, user.password)
      : false;

    if (!user || !validPassword) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 },
      );
    }

    const userWithMfa = user as typeof user & { mfaEnabled?: boolean };

    if (userWithMfa.mfaEnabled) {
      const res = NextResponse.json(
        {
          requiresMfa: true,
          mustChangePassword: user.mustChangePassword,
          message: 'Vérification MFA requise',
        },
        { status: 200 },
      );
      res.cookies.set('mfa_pending', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 5,
      });
      res.cookies.set(
        'must_change_password',
        user.mustChangePassword ? '1' : '0',
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        },
      );
      return res;
    }

    const res = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      company: { id: user.company.id, name: user.company.name },
    });

    res.cookies.set('auth_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set('auth_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.set('must_change_password', user.mustChangePassword ? '1' : '0', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
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
