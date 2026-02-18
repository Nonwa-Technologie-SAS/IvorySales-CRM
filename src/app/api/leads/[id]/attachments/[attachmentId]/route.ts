import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { id: leadId, attachmentId } = await params;

    const attachment = await prisma.leadAttachment.findFirst({
      where: { id: attachmentId, leadId },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Pièce jointe introuvable" },
        { status: 404 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      attachment.storagePath
    );

    try {
      await unlink(filePath);
    } catch (e) {
      // Fichier déjà supprimé ou absent
    }

    await prisma.leadAttachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/leads/[id]/attachments/[attachmentId] error", error);
    return NextResponse.json(
      { error: "Impossible de supprimer la pièce jointe" },
      { status: 500 }
    );
  }
}
