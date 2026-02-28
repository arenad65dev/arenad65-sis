import 'dotenv/config';
import { PrismaClient } from './src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
    const orderItems = await prisma.orderItem.findMany({
        include: { product: { include: { category: true } } }
    });

    console.log("SAMPLES:");
    console.log(JSON.stringify(orderItems.slice(0, 3), null, 2));

    const categoryTotals: Record<string, number> = {};
    let grandTotal = 0;

    orderItems.forEach(item => {
        const total = Number(item.price) * item.quantity;
        const categoryName = item.product.category?.name || (item.product.type === 'SERVICE' ? 'Quadras/Serviços' : 'Outros');
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
}

main().catch(console.error).finally(() => prisma.$disconnect());
