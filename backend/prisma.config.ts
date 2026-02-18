import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: './prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/db',
    },
    migrations: {
        seed: 'npx ts-node prisma/seed.ts',
    },
});
