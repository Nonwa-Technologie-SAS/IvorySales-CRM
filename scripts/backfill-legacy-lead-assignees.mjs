import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function readEnvValue(key) {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = join(process.cwd(), file);
    if (!existsSync(fullPath)) continue;
    const content = readFileSync(fullPath, "utf8");
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx <= 0) continue;
      const envKey = trimmed.slice(0, idx).trim();
      if (envKey !== key) continue;
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return undefined;
}

const connectionString = process.env.DATABASE_URL ?? readEnvValue("DATABASE_URL");
if (!connectionString) {
  console.error("DATABASE_URL manquant. Lancez depuis crm-nextjs avec .env chargé.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const LEGACY_CREATION_ACTIVITY_MATCHERS = [
  "Lead créé manuellement",
  "Lead cree manuellement",
  "Lead importé via Excel",
  "Lead importe via Excel",
];

async function main() {
  const legacyLeads = await prisma.lead.findMany({
    where: { assignedTo: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Leads legacy trouvés (assignedTo NULL): ${legacyLeads.length}`);
  if (!legacyLeads.length) {
    await prisma.$disconnect();
    return;
  }

  let updated = 0;
  let skippedNoActivity = 0;

  for (const lead of legacyLeads) {
    /** Première activité de création/import liée au lead (leadId OU relatedTo). */
    const creatorActivity = await prisma.activity.findFirst({
      where: {
        AND: [
          { OR: [{ leadId: lead.id }, { relatedTo: lead.id }] },
          {
            OR: LEGACY_CREATION_ACTIVITY_MATCHERS.map((value) => ({
              content: { contains: value, mode: "insensitive" },
            })),
          },
        ],
      },
      orderBy: { date: "asc" },
      select: { userId: true },
    });

    if (!creatorActivity?.userId) {
      skippedNoActivity += 1;
      continue;
    }

    const result = await prisma.lead.updateMany({
      where: { id: lead.id, assignedTo: null },
      data: { assignedTo: creatorActivity.userId },
    });
    if (result.count > 0) {
      updated += 1;
    }
  }

  console.log(`Leads mis à jour: ${updated}`);
  console.log(`Leads ignorés (activité introuvable): ${skippedNoActivity}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("Backfill échoué", error);
  await prisma.$disconnect();
  process.exit(1);
});
