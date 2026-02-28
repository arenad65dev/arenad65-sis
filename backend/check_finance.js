const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:81c679e67069021be7d4@easypanel.arenad65.cloud:5433/arenad65?sslmode=disable'
});

async function main() {
  await client.connect();
  const txRes = await client.query('SELECT * FROM "Transaction" WHERE type=\'INCOME\' ORDER BY date DESC LIMIT 50');

  let withOrderIds = 0;
  for (const row of txRes.rows) {
    if (row.orderId) {
      withOrderIds++;
      const orderItems = await client.query(`SELECT product."categoryId" FROM "OrderItem" JOIN "Product" as product ON "OrderItem"."productId" = product.id WHERE "orderId" = $1`, [row.orderId]);
      console.log(`Transaction ID ${row.id} has OrderID ${row.orderId} and ${orderItems.rowCount} items.`);
    } else {
      console.log(`Transaction ID ${row.id} has NO OrderID. Description: ${row.description}`);
    }
  }

  console.log(`Analyzed 50 transactions. Found ${withOrderIds} linked to an Order.`);
  await client.end();
}
main().catch(console.error);
