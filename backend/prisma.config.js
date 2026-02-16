require('dotenv').config();
const { defineConfig } = require('@prisma/config');

module.exports = defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'ts-node src/scripts/seed.ts',
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
