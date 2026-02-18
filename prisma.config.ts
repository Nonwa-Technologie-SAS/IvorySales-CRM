import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Configuration Prisma 7 : URL de connexion PostgreSQL déplacée ici
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
