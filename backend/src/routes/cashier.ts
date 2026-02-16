import { FastifyInstance } from 'fastify';
import { CashierController } from '../controllers/CashierController';
import { authenticate } from '../middlewares/auth';

export async function cashierRoutes(fastify: FastifyInstance) {
    // All cashier routes require authentication
    fastify.addHook('preHandler', authenticate);

    // Open cashier session
    fastify.post('/open', {
        schema: {
            body: {
                type: 'object',
                required: ['initialBalance'],
                properties: {
                    initialBalance: { type: 'number', minimum: 0 }
                }
            }
        }
    }, CashierController.openCashier);

    // Close cashier session
    fastify.post('/:id/close', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['finalBalance'],
                properties: {
                    finalBalance: { type: 'number', minimum: 0 }
                }
            }
        }
    }, CashierController.closeCashier);

    // Record skimming
    fastify.post('/skimming', {
        schema: {
            body: {
                type: 'object',
                required: ['amount', 'reason'],
                properties: {
                    amount: { type: 'number', minimum: 0.01 },
                    reason: { type: 'string', minLength: 1 }
                }
            }
        }
    }, CashierController.recordSkimming);

    // Get current session for user
    fastify.get('/current', CashierController.getCurrentSession);

    // Get all sessions for user
    fastify.get('/sessions', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'string', pattern: '^[0-9]+$' },
                    offset: { type: 'string', pattern: '^[0-9]+$' }
                }
            }
        }
    }, CashierController.getUserSessions);

    // Get session summary
    fastify.get('/sessions/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                }
            }
        }
    }, CashierController.getSessionSummary);
}