import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/mfa/status
 * Vérifie si une étape MFA est en attente (cookie mfa_pending).
 * Retourne { pending: true, emailMasked: "k***@gmail.com" } ou { pending: false }.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mfa_pending")?.value;

    if (!userId) {
      return NextResponse.json({ pending: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ pending: false });
    }

    const u = user as { mfaEnabled?: boolean };
    if (u.mfaEnabled === false) {
      return NextResponse.json({ pending: false });
    }

    const emailMasked =
      user.email.length <= 4
        ? "***"
        : user.email.slice(0, 2) + "***" + user.email.slice(-1);

    return NextResponse.json({
      pending: true,
      emailMasked,
    });
  } catch (error) {
    console.error("GET /api/auth/mfa/status error", error);
    return NextResponse.json({ pending: false });
  }
}
