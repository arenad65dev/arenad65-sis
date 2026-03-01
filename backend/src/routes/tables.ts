import { FastifyInstance } from 'fastify';
import { TableController } from '../controllers/TableController';
import { requireStaff } from '../middlewares/auth';

export async function tablesRoutes(fastify: FastifyInstance) {
    // Add authentication middleware to protect all table routes
    fastify.addHook('onRequest', requireStaff);
    
    // Obter próximo número disponível
    fastify.get('/next-number', TableController.getNextAvailableTableNumber);

    // Listar mesas abertas
    fastify.get('/', TableController.getOpenTables);

    // Buscar mesa específica
    fastify.get('/:tableNumber', TableController.getTable);

    // Abrir mesa
    fastify.post('/open', TableController.openTable);

    // Adicionar itens à mesa
    fastify.post('/:tableNumber/items', TableController.addItemsToTable);
    // Sincronizar itens da mesa (inclui remoções)
    fastify.put('/:tableNumber/items', TableController.syncItemsToTable);

    // Fechar mesa
    fastify.post('/:tableNumber/close', TableController.closeTable);

    // Transferir mesa
    fastify.post('/:tableNumber/transfer', TableController.transferTable);

    // Cancelar mesa
    fastify.delete('/:tableNumber', TableController.cancelTable);
}
