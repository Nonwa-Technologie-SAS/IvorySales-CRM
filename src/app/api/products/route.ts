import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createProductSchema = z.object({
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

    const products = await prisma.product.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products error', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les produits' },
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
    const body = createProductSchema.parse(json);

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        companyId: user.companyId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 },
      );
    }
    console.error('POST /api/products error', error);
    return NextResponse.json(
      { error: 'Impossible de créer le produit' },
      { status: 500 },
    );
  }
}
