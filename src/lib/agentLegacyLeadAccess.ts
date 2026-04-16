import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const LEGACY_CREATION_ACTIVITY_PATTERNS = [
  '%lead créé manuellement%',
  '%lead cree manuellement%',
  '%lead importé via excel%',
  '%lead importe via excel%',
];

/**
 * Legacy transition — à retirer une fois le backfill `assignedTo` validé en prod.
 *
 * Ancien bug: certaines lignes `Activity` n’ont que `relatedTo = lead.id` avec `leadId` NULL.
 * La relation Prisma `Lead.activities` ignore ces lignes, donc un filtre `activities: { some }`
 * ne retrouvait jamais l’historique.
 *
 * Règle: pour un lead non assigné, le « créateur » proxy est l’auteur de la **première**
 * activité de création/import liée au lead (`leadId` OU `relatedTo`), tri par `date` ASC.
 */
export async function getLegacyUnassignedLeadIdsForAgent(
  companyId: string,
  agentUserId: string,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT l.id
      FROM "Lead" l
      WHERE l."companyId" = ${companyId}
        AND l."assignedTo" IS NULL
        AND (
          SELECT a."userId"
          FROM "Activity" a
          WHERE (a."leadId" = l.id OR a."relatedTo" = l.id)
            AND (
              LOWER(a.content) LIKE ${LEGACY_CREATION_ACTIVITY_PATTERNS[0]}
              OR LOWER(a.content) LIKE ${LEGACY_CREATION_ACTIVITY_PATTERNS[1]}
              OR LOWER(a.content) LIKE ${LEGACY_CREATION_ACTIVITY_PATTERNS[2]}
              OR LOWER(a.content) LIKE ${LEGACY_CREATION_ACTIVITY_PATTERNS[3]}
            )
          ORDER BY a.date ASC
          LIMIT 1
        ) = ${agentUserId}
    `,
  );
  return rows.map((r) => r.id);
}

export async function agentCanAccessUnassignedLegacyLead(
  leadId: string,
  companyId: string,
  agentUserId: string,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT l.id
      FROM "Lead" l
      WHERE l.id = ${leadId}
        AND l."companyId" = ${companyId}
        AND l."assignedTo" IS NULL
        AND (
          SELECT a."userId"
          FROM "Activity" a
          WHERE (a."leadId" = l.id OR a."relatedTo" = l.id)
            AND (
              LOWER(a.content) LIKE ${LEGACY_CREATION_ACTIVITY_PATTERNS[0]}
              OR LOWER(a.content) LIKE ${LEGACY_CREATION_ACTIVITY_PATTERNS[1]}
              OR LOWER(a.content) LIKE ${LEGACY_CREATION_ACTIVITY_PATTERNS[2]}
              OR LOWER(a.content) LIKE ${LEGACY_CREATION_ACTIVITY_PATTERNS[3]}
            )
          ORDER BY a.date ASC
          LIMIT 1
        ) = ${agentUserId}
      LIMIT 1
    `,
  );
  return rows.length > 0;
}

/** Leads de la société ayant au moins une activité (liée par leadId ou relatedTo) depuis cutoff. */
export async function getLeadIdsWithActivitySinceInCompany(
  companyId: string,
  cutoff: Date,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT DISTINCT l.id
      FROM "Lead" l
      INNER JOIN "Activity" a ON (a."leadId" = l.id OR a."relatedTo" = l.id)
      WHERE l."companyId" = ${companyId}
        AND a.date >= ${cutoff}
    `,
  );
  return rows.map((r) => r.id);
}

/** PATCH/DELETE: même périmètre que GET pour un AGENT. */
export async function agentCanModifyLead(
  leadId: string,
  companyId: string,
  agentUserId: string,
): Promise<boolean> {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, companyId },
    select: { assignedTo: true },
  });
  if (!lead) return false;
  if (lead.assignedTo === agentUserId) return true;
  if (lead.assignedTo === null) {
    return agentCanAccessUnassignedLegacyLead(leadId, companyId, agentUserId);
  }
  return false;
}
