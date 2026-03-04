import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const interestItemSchema = z.object({
  kind: z.enum(["product", "service"]),
  id: z.string().min(1),
  estimatedValue: z.number().nonnegative().default(0),
});

const upsertInterestsSchema = z.object({
  items: z.array(interestItemSchema),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client introuvable" },
        { status: 404 },
      );
    }

    // Utiliser directement les modèles Prisma (une fois la migration appliquée)
    try {
      const [productInterests, serviceInterests] = await Promise.all([
        prisma.clientProductInterest.findMany({
          where: { clientId: id },
          include: { product: true },
          orderBy: { createdAt: "asc" },
        }),
        prisma.clientServiceInterest.findMany({
          where: { clientId: id },
          include: { service: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

      type ProductInterestRow = { productId: string; product: { name: string }; estimatedValue: number };
      type ServiceInterestRow = { serviceId: string; service: { name: string }; estimatedValue: number };
      return NextResponse.json({
        products: productInterests.map((pi: ProductInterestRow) => ({
          kind: "product" as const,
          id: pi.productId,
          name: pi.product.name,
          estimatedValue: pi.estimatedValue,
        })),
        services: serviceInterests.map((si: ServiceInterestRow) => ({
          kind: "service" as const,
          id: si.serviceId,
          name: si.service.name,
          estimatedValue: si.estimatedValue,
        })),
      });
    } catch (modelError: any) {
      // Si les modèles n'existent pas encore (migration non appliquée),
      // on renvoie des listes vides plutôt qu'une erreur 500
      if (
        modelError?.message?.includes("clientProductInterest") ||
        modelError?.message?.includes("clientServiceInterest")
      ) {
        console.warn(
          "Modèles ClientProductInterest/ClientServiceInterest non disponibles. Migration nécessaire.",
        );
        return NextResponse.json({
          products: [],
          services: [],
        });
      }
      throw modelError;
    }
  } catch (error) {
    console.error("GET /api/clients/[id]/interests error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les intérêts du client" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de requête JSON invalide ou vide" },
        { status: 400 },
      );
    }

    const body = upsertInterestsSchema.parse(json);

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client introuvable" },
        { status: 404 },
      );
    }

    // Filtrer les items valides (avec id non vide)
    const validItems = body.items.filter((item) => item.id && item.id.trim() !== "");

    // Séparer produits et services
    const productItems = validItems.filter((item) => item.kind === "product");
    const serviceItems = validItems.filter((item) => item.kind === "service");

    // Vérifier que les produits/services existent
    if (productItems.length > 0) {
      const productIds = productItems.map((item) => item.id);
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      const existingProductIds = new Set(existingProducts.map((p) => p.id));
      const invalidProducts = productIds.filter((pid) => !existingProductIds.has(pid));
      
      if (invalidProducts.length > 0) {
        return NextResponse.json(
          { error: `Produits introuvables: ${invalidProducts.join(", ")}` },
          { status: 400 },
        );
      }
    }

    if (serviceItems.length > 0) {
      const serviceIds = serviceItems.map((item) => item.id);
      const existingServices = await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true },
      });
      const existingServiceIds = new Set(existingServices.map((s) => s.id));
      const invalidServices = serviceIds.filter((sid) => !existingServiceIds.has(sid));
      
      if (invalidServices.length > 0) {
        return NextResponse.json(
          { error: `Services introuvables: ${invalidServices.join(", ")}` },
          { status: 400 },
        );
      }
    }

    // Vérifier que le client Prisma inclut les modèles (après prisma generate)
    const tx = prisma as unknown as {
      clientProductInterest?: { deleteMany: unknown; createMany: unknown };
      clientServiceInterest?: { deleteMany: unknown; createMany: unknown };
    };
    if (!tx.clientProductInterest || !tx.clientServiceInterest) {
      return NextResponse.json(
        {
          error:
            "Modèles intérêts client non disponibles. Exécutez dans le dossier crm-nextjs : npx prisma generate",
          details:
            "Le client Prisma doit être régénéré pour inclure ClientProductInterest et ClientServiceInterest.",
        },
        { status: 503 },
      );
    }

    // Enregistrer en base de données
    try {
      await prisma.$transaction(async (t) => {
        // Supprimer les anciens intérêts
        await t.clientProductInterest.deleteMany({
          where: { clientId: id },
        });
        await t.clientServiceInterest.deleteMany({
          where: { clientId: id },
        });

        // Créer les nouveaux intérêts
        if (productItems.length > 0) {
          await t.clientProductInterest.createMany({
            data: productItems.map((item) => ({
              clientId: id,
              productId: item.id,
              estimatedValue: item.estimatedValue || 0,
            })),
          });
        }

        if (serviceItems.length > 0) {
          await t.clientServiceInterest.createMany({
            data: serviceItems.map((item) => ({
              clientId: id,
              serviceId: item.id,
              estimatedValue: item.estimatedValue || 0,
            })),
          });
        }
      });

      return NextResponse.json({
        ok: true,
        message: `${validItems.length} intérêt(s) enregistré(s) avec succès`,
      });
    } catch (modelError: unknown) {
      const msg =
        modelError instanceof Error ? modelError.message : String(modelError);
      if (
        msg.includes("clientProductInterest") ||
        msg.includes("clientServiceInterest") ||
        msg.includes("deleteMany") ||
        msg.includes("createMany")
      ) {
        return NextResponse.json(
          {
            error:
              "Régénérez le client Prisma : npx prisma generate (dans crm-nextjs). Si les tables n'existent pas, exécutez aussi : npx prisma migrate dev",
            details:
              "Les modèles ClientProductInterest et ClientServiceInterest ne sont pas disponibles.",
          },
          { status: 503 },
        );
      }
      throw modelError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(", ") },
        { status: 400 },
      );
    }
    console.error("PUT /api/clients/[id]/interests error", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer les intérêts du client" },
      { status: 500 },
    );
  }
}

