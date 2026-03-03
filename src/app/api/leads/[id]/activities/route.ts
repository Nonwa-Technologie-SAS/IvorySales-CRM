import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_FILTER_TYPES = ["CALL", "EMAIL", "MEETING", "NOTE", "ALL"] as const;
type FilterType = (typeof ALLOWED_FILTER_TYPES)[number];

/** GET /api/leads/[id]/activities?skip=0&take=20&filterType=CALL|EMAIL|MEETING|NOTE|ALL */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const skipParam = url.searchParams.get("skip");
    const takeParam = url.searchParams.get("take");
    const filterTypeParam = url.searchParams.get("filterType") as FilterType | null;

    let skip = Number.parseInt(skipParam ?? "0", 10);
    let take = Number.parseInt(takeParam ?? "20", 10);

    if (!Number.isFinite(skip) || skip < 0) skip = 0;
    if (!Number.isFinite(take) || take <= 0) take = 20;
    // Sécurité basique pour éviter des pages trop grosses
    if (take > 100) take = 100;

    const filterType: FilterType =
      filterTypeParam && ALLOWED_FILTER_TYPES.includes(filterTypeParam)
        ? filterTypeParam
        : "ALL";

    const where: { leadId: string; type?: string } =
      filterType === "ALL"
        ? { leadId: id }
        : { leadId: id, type: filterType };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take,
        include: {
          user: { select: { name: true } },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    const hasMore = skip + activities.length < total;

    return NextResponse.json({
      activities,
      total,
      hasMore,
    });
  } catch (error) {
    console.error("GET /api/leads/[id]/activities error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les activités du lead" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/leads/[id]/activities - Activités paginées pour un lead */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);

    const skipParam = url.searchParams.get("skip");
    const takeParam = url.searchParams.get("take");
    const filterTypeParam = url.searchParams.get("filterType");

    const skip = Number.isNaN(Number(skipParam)) ? 0 : Math.max(0, Number(skipParam));
    const takeRaw = Number.isNaN(Number(takeParam)) ? 20 : Number(takeParam);
    const take = Math.min(Math.max(takeRaw, 1), 100); // entre 1 et 100

    const where: {
      leadId: string;
      type?: "CALL" | "EMAIL" | "MEETING" | "NOTE" | "WHATSAPP";
    } = { leadId: id };

    if (filterTypeParam && filterTypeParam !== "ALL") {
      if (
        filterTypeParam === "CALL" ||
        filterTypeParam === "EMAIL" ||
        filterTypeParam === "MEETING" ||
        filterTypeParam === "NOTE" ||
        filterTypeParam === "WHATSAPP"
      ) {
        where.type = filterTypeParam;
      }
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take,
        include: {
          user: {
            select: { name: true },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    const hasMore = total > skip + activities.length;

    return NextResponse.json({ activities, total, hasMore });
  } catch (error) {
    console.error("GET /api/leads/[id]/activities error", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les activités du lead" },
      { status: 500 }
    );
  }
}

