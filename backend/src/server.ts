import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';


dotenv.config();

const server = Fastify({
    logger: true
});

import { prisma } from './lib/prisma';

// Plugins
server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

import { authRoutes } from './routes/auth';
import { dashboardRoutes } from './routes/dashboard';
import { posRoutes } from './routes/pos';
import { inventoryRoutes } from './routes/inventory';
import { cashierRoutes } from './routes/cashier';
import { tablesRoutes } from './routes/tables';
import { clientRoutes } from './routes/clients';
import { userRoutes } from './routes/users';
import { maintenanceRoutes } from './routes/maintenance';
import { financeRoutes } from './routes/finance';
import { authenticate } from './middlewares/auth';

server.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
});

server.register(websocket);

server.register(multipart, {
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Register the authenticate function globally to make it available to all routes
server.decorate('authenticate', authenticate);

server.register(authRoutes, { prefix: '/api/auth' });
server.register(dashboardRoutes, { prefix: '/api/dashboard' });
server.register(posRoutes, { prefix: '/api/pos' });
server.register(inventoryRoutes, { prefix: '/api/inventory' });
server.register(cashierRoutes, { prefix: '/api/cashier' });
server.register(tablesRoutes, { prefix: '/api/tables' });
server.register(clientRoutes, { prefix: '/api/clients' });
server.register(userRoutes, { prefix: '/api/users' });
server.register(maintenanceRoutes, { prefix: '/api/maintenance' });
server.register(financeRoutes, { prefix: '/api/finance' });

// Health Check
server.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date() };
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3333');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
