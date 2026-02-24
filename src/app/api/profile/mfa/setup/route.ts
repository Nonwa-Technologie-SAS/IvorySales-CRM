import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "CRM";

/**
 * POST /api/profile/mfa/setup
 * Génère un secret TOTP, le sauvegarde sur l'utilisateur (en attente de vérification),
 * et retourne l'URL du QR code + le secret en base32 pour saisie manuelle.
 */
export async function POST() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, mfaEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.mfaEnabled) {
      return NextResponse.json(
        { error: "Le MFA est déjà activé." },
        { status: 400 }
      );
    }

    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${user.email})`,
      length: 20,
    });

    if (!secret.base32) {
      return NextResponse.json(
        { error: "Erreur lors de la génération du secret" },
        { status: 500 }
      );
    }

    await prisma.user.update({
      where: { id: authUser.id },
      data: { mfaSecret: secret.base32 },
    });

    const otpauthUrl = secret.otpauth_url;
    if (!otpauthUrl) {
      return NextResponse.json(
        { error: "URL OTP manquante" },
        { status: 500 }
      );
    }

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 220,
      margin: 2,
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCodeDataUrl,
    });
  } catch (error) {
    console.error("POST /api/profile/mfa/setup error", error);
    return NextResponse.json(
      { error: "Impossible de démarrer la configuration MFA" },
      { status: 500 }
    );
  }
}
