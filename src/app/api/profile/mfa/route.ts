import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateMfaSchema = z.object({
  enable: z.boolean(),
});

/** PATCH /api/profile/mfa - Active ou désactive le MFA pour l'utilisateur connecté. */
export async function PATCH(req: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const json = await req.json();
    const body = updateMfaSchema.parse(json);

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        mfaEnabled: body.enable,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mfaEnabled: true,
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/profile/mfa error", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le MFA" },
      { status: 500 }
    );
  }
}

