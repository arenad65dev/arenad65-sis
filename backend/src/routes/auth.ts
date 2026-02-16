import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth';

export async function authRoutes(fastify: FastifyInstance) {
    // Public routes
    fastify.post('/login', AuthController.login);
    fastify.post('/register', AuthController.register);
    
    // Protected routes
    fastify.get('/me', { preHandler: authenticate }, AuthController.me);
    fastify.post('/profile', { preHandler: authenticate }, AuthController.updateProfile);
}
