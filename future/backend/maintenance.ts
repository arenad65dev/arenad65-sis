
import { FastifyInstance } from 'fastify';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { requireStaff } from '../middlewares/auth';

export async function maintenanceRoutes(fastify: FastifyInstance) {
    // Add authentication middleware to protect all maintenance routes
    fastify.addHook('onRequest', requireStaff);
    
    fastify.get('/', MaintenanceController.getAll);
    fastify.post('/', MaintenanceController.create);
    fastify.put('/:id', MaintenanceController.update);
    fastify.delete('/:id', MaintenanceController.delete);
}
