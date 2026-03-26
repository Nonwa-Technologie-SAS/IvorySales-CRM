import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mkdir, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

const UPLOAD_DIR = 'public/uploads/tenders';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'docx',
  'xlsx',
  'csv',
  'pdf',
  'svg',
  'webp',
]);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
  'application/pdf',
]);

async function requireTenderAccess(
  tenderId: string,
  user: { id: string; role: string; companyId: string },
) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    select: { id: true, companyId: true, assignments: { select: { userId: true } } },
  });
  if (!tender || tender.companyId !== user.companyId) {
    return { ok: false as const, status: 404, error: "Appel d'offre introuvable" };
  }
  const isManagerOrAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';
  if (!isManagerOrAdmin && !tender.assignments.some((a) => a.userId === user.id)) {
    return { ok: false as const, status: 403, error: 'Accès refusé' };
  }
  return { ok: true as const };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });

    const { id: tenderId } = await params;
    const access = await requireTenderAccess(tenderId, {
      id: user.id,
      role: user.role,
      companyId: user.companyId,
    });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

    const attachments = await prisma.tenderAttachment.findMany({
      where: { tenderId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('GET /api/tenders/[id]/attachments error', error);
    return NextResponse.json(
      { error: "Impossible de récupérer les pièces jointes de l'appel d'offre" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!user.companyId) return NextResponse.json({ error: 'Aucune société associée' }, { status: 400 });

    const { id: tenderId } = await params;
    const access = await requireTenderAccess(tenderId, {
      id: user.id,
      role: user.role,
      companyId: user.companyId,
    });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 });
    }

    const ext = path.extname(file.name).replace('.', '').toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé (jpg, jpeg, png, docx, xlsx, csv, pdf, svg, webp)' },
        { status: 400 },
      );
    }

    const normalizedName = Buffer.from(file.name, 'latin1')
      .toString('utf8')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${normalizedName}`;
    const dir = path.join(process.cwd(), UPLOAD_DIR, tenderId);
    await mkdir(dir, { recursive: true });
    const absPath = path.join(dir, fileName);
    const bytes = await file.arrayBuffer();
    await writeFile(absPath, Buffer.from(bytes));

    const storagePath = `/uploads/tenders/${tenderId}/${fileName}`;
    const attachment = await prisma.tenderAttachment.create({
      data: {
        tenderId,
        fileName: file.name,
        fileType: ext.toUpperCase(),
        fileSize: file.size,
        storagePath,
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('POST /api/tenders/[id]/attachments error', error);
    return NextResponse.json(
      { error: "Impossible d'ajouter la pièce jointe" },
      { status: 500 },
    );
  }
}
