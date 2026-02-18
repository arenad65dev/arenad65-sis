import { FastifyInstance } from 'fastify';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate } from '../middlewares/auth';

export async function inventoryRoutes(fastify: FastifyInstance) {
    // Todas as rotas precisam de autenticação
    fastify.addHook('preHandler', authenticate);

    // Entrada de mercadoria (purchase order)
    fastify.post('/purchase-order', InventoryController.recordPurchaseOrder);

    // Criar produto
    fastify.post('/products', InventoryController.createOrUpdateProduct);

    // Atualizar produto
    fastify.put('/products/:id', InventoryController.updateProduct);

    // Ajuste manual de estoque
    fastify.post('/stock-adjustment', InventoryController.adjustStock);

    // Buscar histórico de movimentações
    fastify.get('/movements', InventoryController.getStockMovements);

    // Calcular giro mensal
    fastify.get('/turnover', InventoryController.getMonthlyTurnover);

    // Buscar produtos com estoque crítico
    fastify.get('/critical-stock', InventoryController.getCriticalStock);

    // Buscar produtos (com mais detalhes que o POS)
    fastify.get('/products', InventoryController.getProducts);

    // Deletar produto
    fastify.delete('/products/:id', InventoryController.deleteProduct);

    // Buscar categorias
    fastify.get('/categories', InventoryController.getCategories);

    // Upload de imagem
    fastify.post('/upload', InventoryController.uploadImage);
}