const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgres://postgres:81c679e67069021be7d4@easypanel.arenad65.cloud:5433/arenad65?sslmode=disable'
});

async function main() {
    try {
        await client.connect();

        // Get existing categories
        const resDoces = await client.query('SELECT id FROM "Category" WHERE name = $1', ['Doces']);
        const idDoces = resDoces.rows[0].id;

        const resPorcoes = await client.query('SELECT id FROM "Category" WHERE name = $1', ['Porções']);
        const idPorcoes = resPorcoes.rows[0].id;

        let resExp = await client.query('SELECT id FROM "Category" WHERE name = $1', ['Acessórios Esportivos']);
        if (resExp.rowCount === 0) {
            resExp = await client.query('INSERT INTO "Category" (id, name, type, "updatedAt") VALUES (gen_random_uuid(), \'Acessórios Esportivos\', \'PRODUCT\', NOW()) RETURNING id');
        }
        const idAcess = resExp.rows[0].id;

        // Updates
        await client.query('UPDATE "Product" SET "categoryId" = $1 WHERE name = $2', [idPorcoes, 'MEIA PORÇÃO DE FILE ']);
        await client.query('UPDATE "Product" SET "categoryId" = $1 WHERE name = $2', [idDoces, 'CHOCOLATE TRENTO MASSIMO']);
        await client.query('UPDATE "Product" SET "categoryId" = $1 WHERE name = $2', [idAcess, 'GRIP WILSON']);

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

main();
