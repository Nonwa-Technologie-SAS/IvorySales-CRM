import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  companyId: z.string().optional(),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les produits" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = createProductSchema.parse(json);

    let companyId = body.companyId;
    if (!companyId) {
      const existing = await prisma.company.findFirst();
      const company =
        existing ??
        (await prisma.company.create({
          data: { name: "Entreprise démo", plan: "free" },
        }));
      companyId = company.id;
    }

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        companyId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("POST /api/products error", error);
    return NextResponse.json(
      { error: "Impossible de créer le produit" },
      { status: 500 }
    );
  }
}
