import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createServiceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  companyId: z.string().optional(),
});

export async function GET() {
  try {
    const services = await prisma.service.findMany({
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
    const json = await req.json();
    const body = createServiceSchema.parse(json);

    let companyId = body.companyId;
    if (!companyId) {
      const existing = await prisma.company.findFirst();
      const company =
        existing ??
        (await prisma.company.create({
          data: { name: 'Entreprise démo', plan: 'free' },
        }));
      companyId = company.id;
    }

    const service = await prisma.service.create({
      data: {
        name: body.name.trim(),
        companyId,
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
