import { FastifyInstance } from 'fastify';
import { POSController } from '../controllers/POSController';
import { requireCashier } from '../middlewares/auth';

export async function posRoutes(fastify: FastifyInstance) {
    // Add authentication middleware to protect all POS routes
    fastify.addHook('onRequest', requireCashier);

    // Categories
    fastify.get('/categories', POSController.getCategories);

    // Products
    fastify.get('/products', POSController.getProducts);
    fastify.get('/products/:id', POSController.getProduct);
    fastify.put('/products/:id', POSController.updateProduct);

    // Orders
    fastify.get('/orders', POSController.getOrders);
    fastify.get('/orders/:id', POSController.getOrder);
    fastify.post('/orders', POSController.createOrder);
    fastify.post('/orders/:id/pay', POSController.payOrder);

    // Reports
    fastify.get('/sales-report', POSController.getSalesReport);
}
