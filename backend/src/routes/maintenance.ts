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

    // Remove duplicate products
    fastify.post('/remove-duplicates', { preHandler: requireAdmin }, async (request, reply) => {
        try {
            console.log('🔍 Verificando produtos duplicados...\n');

            // 1. Encontrar nomes duplicados
            const duplicates = await prisma.$queryRaw<Array<{ name: string; count: number }>>`
                SELECT name, COUNT(*) as count 
                FROM "Product" 
                GROUP BY name 
                HAVING COUNT(*) > 1
                ORDER BY count DESC
            `;

            if (duplicates.length === 0) {
                return reply.send({
                    success: true,
                    message: 'Nenhum produto duplicado encontrado',
                    duplicatesRemoved: 0
                });
            }

            console.log(`📊 Encontrados ${duplicates.length} produtos com duplicatas:`);
            duplicates.forEach(d => console.log(`   - ${d.name}: ${d.count} cópias`));

            // 2. Para cada nome duplicado, manter apenas o mais recente
            let totalRemoved = 0;

            for (const dup of duplicates) {
                // Buscar todos os produtos com este nome, ordenados por data (mais recente primeiro)
                const products = await prisma.product.findMany({
                    where: { name: dup.name },
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, name: true }
                });

                // O primeiro é o mais recente (manter), o resto deletar
                const keepId = products[0].id;
                const idsToDelete = products.slice(1).map(p => p.id);

                console.log(`\n📝 Produto: ${dup.name}`);
                console.log(`   ✅ Mantendo: ${keepId}`);
                console.log(`   🗑️ Deletando: ${idsToDelete.length} duplicatas`);

                // Deletar OrderItems relacionados aos duplicados
                await prisma.orderItem.deleteMany({
                    where: { productId: { in: idsToDelete } }
                });

                // Deletar StockMovements relacionados aos duplicados
                await prisma.stockMovement.deleteMany({
                    where: { productId: { in: idsToDelete } }
                });

                // Deletar os produtos duplicados
                const deleted = await prisma.product.deleteMany({
                    where: { id: { in: idsToDelete } }
                });

                totalRemoved += deleted.count;
            }

            console.log(`\n✅ Limpeza concluída! ${totalRemoved} produtos duplicados removidos.`);

            return reply.send({
                success: true,
                message: 'Produtos duplicados removidos com sucesso',
                duplicatesFound: duplicates.length,
                duplicatesRemoved: totalRemoved,
                productsAffected: duplicates.map(d => d.name)
            });

        } catch (error) {
            console.error('❌ Erro ao remover duplicados:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            return reply.status(500).send({
                success: false,
                message: 'Erro ao remover produtos duplicados',
                error: errorMessage
            });
        }
    });
}
