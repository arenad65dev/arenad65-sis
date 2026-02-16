import { FastifyInstance } from 'fastify';
import { ClientController } from '../controllers/ClientController';
import { authenticate } from '../middlewares/auth';

export async function clientRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authenticate);

    fastify.post('/', ClientController.create);
    fastify.get('/', ClientController.list);
    fastify.get('/:id', ClientController.get);
}
