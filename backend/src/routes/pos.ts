import { FastifyInstance } from 'fastify';
import { POSController } from '../controllers/POSController';
import { requireCashier } from '../middlewares/auth';

export async function posRoutes(fastify: FastifyInstance) {
    // Add authentication middleware to protect all POS routes
    fastify.addHook('onRequest', requireCashier);

    fastify.get('/products', POSController.getProducts);
    fastify.post('/orders', POSController.createOrder);
    fastify.post('/orders/:id/pay', POSController.payOrder);
}
