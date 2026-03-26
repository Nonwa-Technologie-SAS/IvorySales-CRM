import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Adapter PostgreSQL pour Prisma 7 (moteur \"client\")
const rawConnectionString = process.env.DATABASE_URL;
const ensureSslModeRequire = (url: string) => {
  // Sur certains hébergeurs (ex: db.prisma.io), SSL est requis.
  // On force sslmode=require si absent pour éviter des erreurs TLS intermittentes.
  if (!/db\.prisma\.io/i.test(url)) return url;
  if (/sslmode=/i.test(url)) return url;
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}sslmode=require`;
};

const connectionString = rawConnectionString
  ? ensureSslModeRequire(rawConnectionString)
  : undefined;
if (!connectionString) {
  throw new Error("DATABASE_URL manquant dans l'environnement");
}

const adapter = new PrismaPg({ connectionString });

// Évite de recréer un client Prisma en dev (hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
