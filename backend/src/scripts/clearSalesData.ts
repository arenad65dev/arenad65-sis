import { prisma } from '../lib/prisma';

async function clearSalesData() {
    console.log('🧹 Limpando dados de vendas e transações...\n');

    try {
        // 1. Limpar OrderItems primeiro (tem FK para Orders e Products)
        console.log('1. Deletando itens de pedidos...');
        const orderItemsCount = await prisma.orderItem.deleteMany({});
        console.log(`   ✅ ${orderItemsCount.count} itens deletados`);

        // 2. Limpar Orders
        console.log('2. Deletando pedidos...');
        const ordersCount = await prisma.order.deleteMany({});
        console.log(`   ✅ ${ordersCount.count} pedidos deletados`);

        // 3. Limpar Transactions
        console.log('3. Deletando transações...');
        const transactionsCount = await prisma.transaction.deleteMany({});
        console.log(`   ✅ ${transactionsCount.count} transações deletadas`);

        // 4. Limpar ActivityLogs
        console.log('4. Deletando logs de atividades...');
        const logsCount = await prisma.activityLog.deleteMany({});
        console.log(`   ✅ ${logsCount.count} logs deletados`);

        // 5. Limpar CashierSessions
        console.log('5. Deletando sessões de caixa...');
        const sessionsCount = await prisma.cashierSession.deleteMany({});
        console.log(`   ✅ ${sessionsCount.count} sessões deletadas`);

        // 6. Limpar StockMovements
        console.log('6. Deletando movimentações de estoque...');
        const movementsCount = await prisma.stockMovement.deleteMany({});
        console.log(`   ✅ ${movementsCount.count} movimentações deletadas`);

        // 7. Zerar estoque de todos os produtos
        console.log('7. Zerando estoque dos produtos...');
        const productsUpdated = await prisma.product.updateMany({
            data: { stock: 0 }
        });
        console.log(`   ✅ ${productsUpdated.count} produtos atualizados`);

        console.log('\n✨ Limpeza concluída com sucesso!');
        console.log('\n📊 Resumo:');
        console.log(`   - Produtos mantidos: ${await prisma.product.count()}`);
        console.log(`   - Categorias mantidas: ${await prisma.category.count()}`);
        console.log(`   - Usuários mantidos: ${await prisma.user.count()}`);
        console.log(`   - Pedidos restantes: ${await prisma.order.count()}`);
        console.log(`   - Transações restantes: ${await prisma.transaction.count()}`);

    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

clearSalesData();
