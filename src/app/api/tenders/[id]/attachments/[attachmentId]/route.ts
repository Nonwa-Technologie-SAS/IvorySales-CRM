import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });

    const { id: tenderId, attachmentId } = await params;
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      select: { id: true, companyId: true },
    });
    if (!tender || tender.companyId !== user.companyId) {
      return NextResponse.json({ error: "Appel d'offre introuvable" }, { status: 404 });
    }

    const attachment = await prisma.tenderAttachment.findFirst({
      where: { id: attachmentId, tenderId },
      select: { id: true, storagePath: true, uploadedById: true },
    });
    if (!attachment) {
      return NextResponse.json({ error: 'Pièce jointe introuvable' }, { status: 404 });
    }

    const isManagerOrAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';
    const canDelete = isManagerOrAdmin || attachment.uploadedById === user.id;
    if (!canDelete) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), 'public', attachment.storagePath);
    try {
      await unlink(filePath);
    } catch {
      // ignore: fichier déjà absent
    }

    await prisma.tenderAttachment.delete({ where: { id: attachment.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/tenders/[id]/attachments/[attachmentId] error', error);
    return NextResponse.json(
      { error: 'Impossible de supprimer la pièce jointe' },
      { status: 500 },
    );
  }
}
