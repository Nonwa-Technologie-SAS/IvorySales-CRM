import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createServiceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: 'Non authentifié ou société introuvable' },
        { status: 401 },
      );
    }

    const services = await prisma.service.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('GET /api/services error', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les services' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: 'Non authentifié ou société introuvable' },
        { status: 401 },
      );
    }

    const json = await req.json();
    const body = createServiceSchema.parse(json);

    const service = await prisma.service.create({
      data: {
        name: body.name.trim(),
        companyId: user.companyId,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }
    console.error('POST /api/services error', error);
    return NextResponse.json(
      { error: 'Impossible de créer le service' },
      { status: 500 },
    );
  }
}
