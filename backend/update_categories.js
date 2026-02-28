const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgres://postgres:81c679e67069021be7d4@easypanel.arenad65.cloud:5433/arenad65?sslmode=disable'
});

async function main() {
    try {
        await client.connect();

        // Helper function to get or create a category
        async function getOrCreateCategory(name) {
            let res = await client.query('SELECT id FROM "Category" WHERE name = $1', [name]);
            if (res.rowCount === 0) {
                // Create it
                res = await client.query(
                    'INSERT INTO "Category" (id, name, type, "updatedAt") VALUES (gen_random_uuid(), $1, \'PRODUCT\', NOW()) RETURNING id',
                    [name]
                );
                console.log(`Created category: ${name}`);
            } else {
                console.log(`Found category: ${name}`);
            }
            return res.rows[0].id;
        }

        const dayUseCatId = await getOrCreateCategory('Day-Use');
        const docesCatId = await getOrCreateCategory('Doces');
        const bebidasCatId = await getOrCreateCategory('Bebidas');
        const porcoesCatId = await getOrCreateCategory('Porções');

        // Mappings of product names to their new category IDs
        const updates = [
            { name: 'DAY USE ALUNOS', catId: dayUseCatId },
            { name: 'DAY USE NÃO ALUNOS', catId: dayUseCatId },
            { name: 'PIRULITO YOGURTE', catId: docesCatId },
            { name: 'PIRULITO CHICLETE', catId: docesCatId },
            { name: 'HALLS', catId: docesCatId },
            { name: 'PIPOCA', catId: docesCatId },
            { name: 'CHOKITO', catId: docesCatId },
            { name: 'BATTON', catId: docesCatId },
            { name: 'TRIDENT', catId: docesCatId },
            { name: 'ÁGUA MINERAL C/ GÁS', catId: bebidasCatId },
            { name: 'MICHELOB LATÃO ', catId: bebidasCatId },
            { name: 'REFRIGERANTES', catId: bebidasCatId },
            { name: 'PORÇÃO DE FILÉ', catId: porcoesCatId },
            { name: 'PORÇÃO DE PICANHA', catId: porcoesCatId },
        ];

        console.log('\n--- Updating Products ---');
        for (const update of updates) {
            const res = await client.query(
                'UPDATE "Product" SET "categoryId" = $1 WHERE name = $2 RETURNING name',
                [update.catId, update.name]
            );
            if (res.rowCount > 0) {
                console.log(`Updated ${update.name}`);
            }
        }

        console.log('\nDone!');
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

main();
