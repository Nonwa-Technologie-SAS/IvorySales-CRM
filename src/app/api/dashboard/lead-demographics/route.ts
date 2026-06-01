import { requireRole, resolveGroupCompanyScope } from '@/lib/auth';
import {
  aggregateCompanyNames,
  aggregateNormalizedRows,
  aggregateTopLabels,
  normalizeActivityDomain,
  normalizeCivility,
  normalizeLocation,
  sortDemographicRows,
  sumDemographicRows,
} from '@/lib/lead-demographics';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type LeadDemographicsResponse = {
  total: number;
  byCivility: { label: string; count: number }[];
  byActivityDomain: { label: string; count: number }[];
  byCompanyName: { label: string; count: number }[];
  byLocation: { label: string; count: number }[];
};

export async function GET(req: NextRequest) {
  const auth = await requireRole(['ADMIN', 'MANAGER']);
  if (auth instanceof Response) return auth;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const scope = await resolveGroupCompanyScope(
    user,
    searchParams.get('companyId'),
  );
  if (scope instanceof NextResponse) return scope;

  try {
    const where = { companyId: scope.companyId };

    const [civilityGroup, domainGroup, companyGroup, locationGroup, total] =
      await Promise.all([
        prisma.lead.groupBy({
          by: ['civility'],
          where,
          _count: { _all: true },
        }),
        prisma.lead.groupBy({
          by: ['activityDomain'],
          where,
          _count: { _all: true },
        }),
        prisma.lead.groupBy({
          by: ['companyName'],
          where,
          _count: { _all: true },
        }),
        prisma.lead.groupBy({
          by: ['location'],
          where,
          _count: { _all: true },
        }),
        prisma.lead.count({ where }),
      ]);

    const byCivility = aggregateNormalizedRows(
      civilityGroup.map((row) => ({
        value: row.civility,
        count: row._count._all,
      })),
      normalizeCivility,
    );
    const byActivityDomain = aggregateNormalizedRows(
      domainGroup.map((row) => ({
        value: row.activityDomain,
        count: row._count._all,
      })),
      normalizeActivityDomain,
    );
    const byCompanyName = aggregateCompanyNames(
      companyGroup.map((row) => ({
        value: row.companyName,
        count: row._count._all,
      })),
      12,
    );
    const byLocation = aggregateTopLabels(
      locationGroup.map((row) => ({
        value: row.location,
        count: row._count._all,
      })),
      normalizeLocation,
      10,
    );

    const payload: LeadDemographicsResponse = {
      total,
      byCivility: sortDemographicRows(byCivility),
      byActivityDomain: sortDemographicRows(byActivityDomain),
      byCompanyName: sortDemographicRows(byCompanyName),
      byLocation: sortDemographicRows(byLocation),
    };

    if (total > 0) {
      const sumCiv = sumDemographicRows(payload.byCivility);
      const sumDom = sumDemographicRows(payload.byActivityDomain);
      const sumCo = sumDemographicRows(payload.byCompanyName);
      const sumLoc = sumDemographicRows(payload.byLocation);
      if (
        sumCiv !== total ||
        sumDom !== total ||
        sumCo !== total ||
        sumLoc !== total
      ) {
        console.warn('lead-demographics: sum mismatch', {
          total,
          sumCiv,
          sumDom,
          sumCo,
          sumLoc,
        });
      }
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('GET /api/dashboard/lead-demographics error', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
