import { FastifyInstance } from 'fastify';
import { DashboardController } from '../controllers/DashboardController';
import { requireManager } from '../middlewares/auth';

export async function dashboardRoutes(fastify: FastifyInstance) {
    // Add authentication middleware to protect all dashboard routes
    fastify.addHook('onRequest', requireManager);
    
    fastify.get('/kpis', DashboardController.getKPIs);
    fastify.get('/transactions', DashboardController.getRecentTransactions);
    fastify.get('/analytics', DashboardController.getAnalytics);
}
