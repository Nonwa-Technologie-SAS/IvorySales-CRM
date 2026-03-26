import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/** GET /api/auth/me - Retourne les infos de l'utilisateur connecté */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const isTransientDbError = (err: unknown) => {
      const e = err as { code?: string; message?: string } | null;
      const msg = String(e?.message ?? "");
      return (
        e?.code === "ECONNRESET" ||
        /socket disconnected before secure TLS connection was established/i.test(msg) ||
        /ECONNRESET/i.test(msg)
      );
    };
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const loadUser = async () =>
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              plan: true,
              createdAt: true,
            },
          },
        },
      });

    let user: Awaited<ReturnType<typeof loadUser>> | null = null;
    try {
      user = await loadUser();
    } catch (err) {
      if (!isTransientDbError(err)) throw err;
      await sleep(200);
      try {
        user = await loadUser();
      } catch (err2) {
        if (!isTransientDbError(err2)) throw err2;
        await sleep(500);
        user = await loadUser();
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const u = user as { mfaEnabled?: boolean; mfaSecret?: string | null };
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: u.mfaEnabled ?? false,
      mfaSetupPending: !!u.mfaSecret && !u.mfaEnabled,
      company: user.company,
    });
  } catch (error) {
    console.error("GET /api/auth/me error", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
