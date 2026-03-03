import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateRange(from: string | null, to: string | null): { fromDate: Date; toDate: Date } | null {
  if (!from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) return null;
  const fromDate = new Date(from + "T00:00:00.000Z");
  const toDate = new Date(to + "T23:59:59.999Z");
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) return null;
  return { fromDate, toDate };
}

export type SalesSummaryReport = {
  global: { nbLeadsTotal: number; nbClientsTotal: number; caTotal: number };
  byUser: Array<{
    userId: string;
    userName: string;
    nbLeads: number;
    nbClients: number;
    caTotal: number;
    conversionRate: number;
  }>;
  bySource: Array<{
    source: string | null;
    nbLeads: number;
    nbClients: number;
  }>;
};

export async function GET(req: NextRequest) {
  const auth = await requireRole(["ADMIN", "MANAGER"]);
  if (auth instanceof Response) return auth;
  const { user } = auth;
  const companyId = user.companyId;
  if (!companyId) {
    return NextResponse.json(
      { error: "Société non associée à l'utilisateur" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userId = searchParams.get("userId") || undefined;
  const source = searchParams.get("source") || undefined;

  const range = parseDateRange(from, to);
  if (!range) {
    return NextResponse.json(
      { error: "Paramètres from et to obligatoires (format YYYY-MM-DD), avec from <= to" },
      { status: 400 }
    );
  }
  const { fromDate, toDate } = range;

  const leadWhere = {
    companyId,
    createdAt: { gte: fromDate, lte: toDate },
    ...(userId && { assignedTo: userId }),
    ...(source !== undefined && source !== "" && { source }),
  };

  const clientWhere = {
    companyId,
    convertedAt: { gte: fromDate, lte: toDate },
    ...(userId && { convertedById: userId }),
  };

  const [nbLeadsTotal, nbClientsTotal, clientsForCa, leadUserCounts, clientUserCounts, leadSourceCounts, clientSourceCounts] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),
    prisma.client.count({ where: clientWhere }),
    prisma.client.findMany({
      where: clientWhere,
      select: { totalRevenue: true },
    }),
    prisma.lead.groupBy({
      by: ["assignedTo"],
      where: { ...leadWhere, assignedTo: { not: null } },
      _count: { id: true },
    }),
    prisma.client.groupBy({
      by: ["convertedById"],
      where: { ...clientWhere, convertedById: { not: null } },
      _count: { id: true },
      _sum: { totalRevenue: true },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      where: leadWhere,
      _count: { id: true },
    }),
    prisma.client.groupBy({
      by: ["source"],
      where: clientWhere,
      _count: { id: true },
    }),
  ]);

  const caTotal = clientsForCa.reduce((s, c) => s + (c.totalRevenue ?? 0), 0);

  const userIds = new Set<string>();
  leadUserCounts.forEach((r) => r.assignedTo && userIds.add(r.assignedTo));
  clientUserCounts.forEach((r) => r.convertedById && userIds.add(r.convertedById));
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const byUser: SalesSummaryReport["byUser"] = [...userIds].map((uid) => {
    const leads = leadUserCounts.find((r) => r.assignedTo === uid)?._count?.id ?? 0;
    const clientsRow = clientUserCounts.find((r) => r.convertedById === uid);
    const clients = clientsRow?._count?.id ?? 0;
    const ca = clientsRow?._sum?.totalRevenue ?? 0;
    return {
      userId: uid,
      userName: userMap.get(uid) ?? "Inconnu",
      nbLeads: leads,
      nbClients: clients,
      caTotal: ca,
      conversionRate: leads > 0 ? (clients / leads) * 100 : 0,
    };
  });

  const sourceSet = new Set<string | null>();
  leadSourceCounts.forEach((r) => sourceSet.add(r.source ?? null));
  clientSourceCounts.forEach((r) => sourceSet.add(r.source ?? null));
  const bySource: SalesSummaryReport["bySource"] = [...sourceSet].map((src) => ({
    source: src ?? "Inconnu",
    nbLeads: leadSourceCounts.find((r) => (r.source ?? null) === src)?._count?.id ?? 0,
    nbClients: clientSourceCounts.find((r) => (r.source ?? null) === src)?._count?.id ?? 0,
  }));

  const report: SalesSummaryReport = {
    global: { nbLeadsTotal, nbClientsTotal, caTotal },
    byUser,
    bySource,
  };

  return NextResponse.json(report);
}
