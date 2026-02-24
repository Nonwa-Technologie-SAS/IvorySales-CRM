import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

/** PATCH /api/profile/password - Change le mot de passe de l'utilisateur connecté. */
export async function PATCH(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const json = await req.json();
    const body = changePasswordSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // ⚠️ Mot de passe stocké en clair pour le moment (voir commentaire dans /api/auth/login)
    if (user.password !== body.currentPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        password: body.newPassword,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/profile/password error", error);
    return NextResponse.json(
      { error: "Impossible de changer le mot de passe" },
      { status: 500 }
    );
  }
}

