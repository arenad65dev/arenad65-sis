const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgres://postgres:81c679e67069021be7d4@easypanel.arenad65.cloud:5433/arenad65?sslmode=disable'
});

async function main() {
    try {
        await client.connect();

        // Query all order items with product and category info
        const res = await client.query(`
      SELECT 
        oi.id, oi.quantity, oi.price, 
        p.name as product_name, p.type as product_type,
        c.name as category_name
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      LEFT JOIN "Category" c ON p."categoryId" = c.id
    `);

        const orderItems = res.rows;
        console.log(`Found ${orderItems.length} order items`);

        const categoryTotals = {};
        let grandTotal = 0;

        orderItems.forEach(item => {
            const total = Number(item.price) * Number(item.quantity);
            const categoryName = item.category_name || (item.product_type === 'SERVICE' ? 'Quadras/Serviços' : 'Outros');
            categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + total;
            grandTotal += total;
        });

        if (grandTotal === 0) grandTotal = 1;

        const result = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value / grandTotal) * 100)
        })).sort((a, b) => b.value - a.value);

        console.log("FINAL RESULT:", JSON.stringify(result, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
