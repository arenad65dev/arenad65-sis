import { FastifyInstance } from 'fastify';
import { requireAdmin, requireManager } from '../middlewares/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CASHIER', 'WAITER']),
    department: z.string().optional(),
    avatar: z.string().optional()
});

const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CASHIER', 'WAITER']).optional(),
    department: z.string().optional(),
    avatar: z.string().optional(),
    isActive: z.boolean().optional()
});

export async function userRoutes(fastify: FastifyInstance) {
    // All routes require authentication
    fastify.addHook('onRequest', requireManager);

    // List all users
    fastify.get('/', async (request, reply) => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    avatar: true,
                    department: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { name: 'asc' }
            });
            return reply.send(users);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching users' });
        }
    });

    // Get single user
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    avatar: true,
                    department: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                return reply.status(404).send({ message: 'User not found' });
            }

            return reply.send(user);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching user' });
        }
    });

    // Create user (admin only)
    fastify.post('/', {
        schema: {
            body: createUserSchema
        }
    }, async (request, reply) => {
        try {
            // @ts-ignore - JWT user
            const currentUserRole = request.user?.role;
            
            if (currentUserRole !== 'ADMIN') {
                return reply.status(403).send({ message: 'Only admins can create users' });
            }

            const data = createUserSchema.parse(request.body);
            
            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });

            if (existingUser) {
                return reply.status(400).send({ message: 'Email already in use' });
            }

            // Hash password
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: data.role,
                    department: data.department,
                    avatar: data.avatar
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    avatar: true,
                    department: true,
                    createdAt: true
                }
            });

            return reply.status(201).send(user);
        } catch (error) {
            request.log.error(error);
            
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ message: 'Validation error', errors: error.issues });
            }
            
            return reply.status(500).send({ message: 'Error creating user' });
        }
    });

    // Update user
    fastify.put('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const data = updateUserSchema.parse(request.body);

            // If updating password, hash it
            if (data.password) {
                const bcrypt = require('bcryptjs');
                data.password = await bcrypt.hash(data.password, 10);
            }

            const user = await prisma.user.update({
                where: { id },
                data,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    avatar: true,
                    department: true,
                    updatedAt: true
                }
            });

            return reply.send(user);
        } catch (error) {
            request.log.error(error);
            
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ message: 'Validation error', errors: error.issues });
            }
            
            return reply.status(500).send({ message: 'Error updating user' });
        }
    });

    // Delete user (soft delete - deactivate)
    fastify.delete('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            // @ts-ignore - JWT user
            const currentUserId = request.user?.id;
            
            if (currentUserId === id) {
                return reply.status(400).send({ message: 'Cannot deactivate your own account' });
            }

            const user = await prisma.user.update({
                where: { id },
                data: { isActive: false },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isActive: true
                }
            });

            return reply.send(user);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error deactivating user' });
        }
    });

    // Reactivate user
    fastify.post('/:id/reactivate', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const user = await prisma.user.update({
                where: { id },
                data: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isActive: true
                }
            });

            return reply.send(user);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error reactivating user' });
        }
    });
}
