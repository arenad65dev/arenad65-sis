import { FastifyInstance } from 'fastify';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate, requireStaff } from '../middlewares/auth';

export async function inventoryRoutes(fastify: FastifyInstance) {
    // Todas as rotas precisam de autenticação
    fastify.addHook('preHandler', authenticate);

    // Entrada de mercadoria (purchase order)
    fastify.post('/purchase-order', { preHandler: requireStaff }, InventoryController.recordPurchaseOrder);

    // Criar produto
    fastify.post('/products', { preHandler: requireStaff }, InventoryController.createOrUpdateProduct);

    // Atualizar produto
    fastify.put<{ Params: { id: string }; Body: any }>('/products/:id', { preHandler: requireStaff }, InventoryController.updateProduct);

    // Ajuste manual de estoque
    fastify.post('/stock-adjustment', { preHandler: requireStaff }, InventoryController.adjustStock);

    // Buscar histórico de movimentações
    fastify.get('/movements', InventoryController.getStockMovements);

    // Calcular giro mensal
    fastify.get('/turnover', InventoryController.getMonthlyTurnover);

    // Buscar produtos com estoque crítico
    fastify.get('/critical-stock', InventoryController.getCriticalStock);

    // Buscar produtos (com mais detalhes que o POS)
    fastify.get('/products', InventoryController.getProducts);

    // Deletar produto
    fastify.delete<{ Params: { id: string } }>('/products/:id', { preHandler: requireStaff }, InventoryController.deleteProduct);

    // Buscar categorias
    fastify.get('/categories', InventoryController.getCategories);

    // Upload de imagem
    fastify.post('/upload', { preHandler: requireStaff }, InventoryController.uploadImage);
}
