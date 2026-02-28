const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgres://postgres:81c679e67069021be7d4@easypanel.arenad65.cloud:5433/arenad65?sslmode=disable'
});

async function main() {
    try {
        await client.connect();
        console.log("Connected to database successfully!");

        // Check Categories
        const catRes = await client.query('SELECT id, name FROM "Category"');
        console.log(`\n--- Categories (${catRes.rowCount}) ---`);
        console.table(catRes.rows);

        // Check Products without category
        const prodNoCat = await client.query(`
      SELECT name, price, stock FROM "Product" WHERE "categoryId" IS NULL AND type = 'PRODUCT' LIMIT 10
    `);
        console.log(`\n--- Products WITHOUT Category (showing top 10 of ${prodNoCat.rowCount}) ---`);
        console.table(prodNoCat.rows);

        // Check Products with category
        const prodCat = await client.query(`
      SELECT p.name, c.name as category, p.price 
      FROM "Product" p 
      JOIN "Category" c ON p."categoryId" = c.id 
      WHERE p.type = 'PRODUCT' LIMIT 10
    `);
        console.log(`\n--- Products WITH Category (showing top 10 of ${prodCat.rowCount}) ---`);
        console.table(prodCat.rows);

        // Check Order Items mapping
        const orderItems = await client.query(`
      SELECT c.name as category, SUM(oi.quantity) as qtd_sold, SUM(oi.price * oi.quantity) as total_revenue
      FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      JOIN "Product" p ON oi."productId" = p.id
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE o.status = 'PAID'
      GROUP BY c.name
      ORDER BY total_revenue DESC
    `);
        console.log('\n--- Revenue by Category (PAID Orders) ---');
        console.table(orderItems.rows);

        // Specific check on OrderItems with null category
        const nullCatSales = await client.query(`
      SELECT p.name, SUM(oi.quantity) as qtd_sold
      FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      JOIN "Product" p ON oi."productId" = p.id
      WHERE o.status = 'PAID' AND p."categoryId" IS NULL
      GROUP BY p.name
    `);
        if (nullCatSales.rowCount > 0) {
            console.log('\n--- Sales of products without category ---');
            console.table(nullCatSales.rows);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

main();
