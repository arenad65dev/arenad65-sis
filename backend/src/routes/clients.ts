import { FastifyInstance } from 'fastify';
import { ClientController } from '../controllers/ClientController';
import { authenticate } from '../middlewares/auth';

export async function clientRoutes(fastify: FastifyInstance) {
    fastify.post('/', ClientController.create);

    fastify.register(async function protectedClientRoutes(protectedFastify) {
        protectedFastify.addHook('preHandler', authenticate);
        protectedFastify.get('/', ClientController.list);
        protectedFastify.get('/:id', ClientController.get);
    });
}
