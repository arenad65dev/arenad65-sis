import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { requireAdmin } from '../middlewares/auth';

export async function maintenanceRoutes(fastify: FastifyInstance) {
    // Clear all sales data - requires admin
    fastify.post('/clear-sales-data', { preHandler: requireAdmin }, async (request, reply) => {
        try {
            console.log('🧹 Limpando dados de vendas e transações...\n');

            // 1. Limpar OrderItems primeiro
            const orderItemsCount = await prisma.orderItem.deleteMany({});
            console.log(`   ✅ ${orderItemsCount.count} itens deletados`);

            // 2. Limpar Orders
            const ordersCount = await prisma.order.deleteMany({});
            console.log(`   ✅ ${ordersCount.count} pedidos deletados`);

            // 3. Limpar Transactions
            const transactionsCount = await prisma.transaction.deleteMany({});
            console.log(`   ✅ ${transactionsCount.count} transações deletadas`);

            // 4. Limpar ActivityLogs
            const logsCount = await prisma.activityLog.deleteMany({});
            console.log(`   ✅ ${logsCount.count} logs deletados`);

            // 5. Limpar Skimming (sangrias) primeiro - tem FK para CashierSession
            const skimmingCount = await prisma.skimming.deleteMany({});
            console.log(`   ✅ ${skimmingCount.count} sangrias deletadas`);

            // 6. Limpar CashierSessions
            const sessionsCount = await prisma.cashierSession.deleteMany({});
            console.log(`   ✅ ${sessionsCount.count} sessões deletadas`);

            // 7. Limpar StockMovements
            const movementsCount = await prisma.stockMovement.deleteMany({});
            console.log(`   ✅ ${movementsCount.count} movimentações deletadas`);

            // 7. Zerar estoque de todos os produtos
            const productsUpdated = await prisma.product.updateMany({
                data: { stock: 0 }
            });
            console.log(`   ✅ ${productsUpdated.count} produtos com estoque zerado`);

            console.log('\n✨ Limpeza concluída com sucesso!');

            return reply.send({
                success: true,
                message: 'Dados de vendas limpos com sucesso',
                details: {
                    orderItemsDeleted: orderItemsCount.count,
                    ordersDeleted: ordersCount.count,
                    transactionsDeleted: transactionsCount.count,
                    logsDeleted: logsCount.count,
                    skimmingDeleted: skimmingCount.count,
                    sessionsDeleted: sessionsCount.count,
                    movementsDeleted: movementsCount.count,
                    productsReset: productsUpdated.count
                }
            });
        } catch (error) {
            console.error('❌ Erro durante a limpeza:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            return reply.status(500).send({ 
                success: false, 
                message: 'Erro ao limpar dados',
                error: errorMessage 
            });
        }
    });
}
