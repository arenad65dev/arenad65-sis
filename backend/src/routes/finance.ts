import { FastifyInstance } from 'fastify';
import { FinanceController } from '../controllers/FinanceController';
import { requireStaff } from '../middlewares/auth';

export async function financeRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', requireStaff);

  fastify.get('/summary', FinanceController.getSummary);
  fastify.get('/transactions', FinanceController.getTransactions);
}
