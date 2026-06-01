import { loadEnvForPrisma } from './prisma/load-env';
import { defineConfig, env } from 'prisma/config';

loadEnvForPrisma();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
