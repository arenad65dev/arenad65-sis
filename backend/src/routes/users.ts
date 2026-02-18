import { FastifyInstance } from 'fastify';
import { requireAdmin, requireManager, authenticate } from '../middlewares/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CASHIER', 'WAITER']),
    department: z.string().optional(),
    avatar: z.string().optional()
});

const updateUserSchema = z.object({
    name: z.string().min(1).optional().nullable(),
    email: z.string().email().optional().nullable(),
    password: z.string().min(6).optional().nullable(),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CASHIER', 'WAITER']).optional().nullable(),
    department: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    isActive: z.boolean().optional().nullable()
});

const permissionSchema = z.object({
    module: z.string(),
    action: z.string(),
    granted: z.boolean()
});

async function logActivity(prisma: any, userId: string, action: string, module: string, description?: string, metadata?: any) {
    await prisma.activityLog.create({
        data: {
            userId,
            action,
            module,
            details: description,
            metadata
        }
    });
}

export async function userRoutes(fastify: FastifyInstance) {
    // All routes require authentication
    fastify.addHook('onRequest', requireManager);

    // Get current user permissions
    fastify.get('/me/permissions', async (request, reply) => {
        try {
            // @ts-ignore
            const userId = request.user?.id;
            
            const permissions = await prisma.permission.findMany({
                where: { userId }
            });
            
            return reply.send(permissions);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching permissions' });
        }
    });

    // Get all permissions for a user
    fastify.get('/:id/permissions', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            
            const permissions = await prisma.permission.findMany({
                where: { userId: id }
            });
            
            return reply.send(permissions);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching permissions' });
        }
    });

    // Update user permissions
    fastify.put('/:id/permissions', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const data = permissionSchema.parse(request.body);
            // @ts-ignore
            const currentUserId = request.user?.id;

            const permission = await prisma.permission.upsert({
                where: {
                    userId_module_action: {
                        userId: id,
                        module: data.module,
                        action: data.action
                    }
                },
                create: {
                    userId: id,
                    module: data.module,
                    action: data.action,
                    granted: data.granted
                },
                update: {
                    granted: data.granted
                }
            });

            await logActivity(prisma, currentUserId, 'UPDATE_PERMISSION', 'Usuários', 
                `Alterou permissão ${data.module}/${data.action} para ${data.granted ? 'ATIVADO' : 'DESATIVADO'}`);

            return reply.send(permission);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error updating permission' });
        }
    });

    // Bulk update permissions
    fastify.put('/:id/permissions/bulk', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const permissions = request.body as { module: string, action: string, granted: boolean }[];
            // @ts-ignore
            const currentUserId = request.user?.id;

            for (const perm of permissions) {
                await prisma.permission.upsert({
                    where: {
                        userId_module_action: {
                            userId: id,
                            module: perm.module,
                            action: perm.action
                        }
                    },
                    create: {
                        userId: id,
                        module: perm.module,
                        action: perm.action,
                        granted: perm.granted
                    },
                    update: {
                        granted: perm.granted
                    }
                });
            }

            await logActivity(prisma, currentUserId, 'BULK_UPDATE_PERMISSIONS', 'Usuários', 
                `Atualizou ${permissions.length} permissões do usuário`);

            return reply.send({ message: 'Permissions updated' });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error updating permissions' });
        }
    });

    // Get user activity logs
    fastify.get('/:id/logs', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const { limit = '50' } = request.query as { limit?: string };
            
            const logs = await prisma.activityLog.findMany({
                where: { userId: id },
                orderBy: { createdAt: 'desc' },
                take: parseInt(limit)
            });
            
            return reply.send(logs);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching logs' });
        }
    });

    // List all users
    fastify.get('/', async (request, reply) => {
        try {
            // @ts-ignore
            const currentUserId = request.user?.id;

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

            // Get permissions for all users
            const userIds = users.map(u => u.id);
            const permissions = await prisma.permission.findMany({
                where: { userId: { in: userIds } }
            });

            // Attach permissions to users
            const usersWithPermissions = users.map(user => ({
                ...user,
                permissions: permissions.filter(p => p.userId === user.id)
            }));

            return reply.send(usersWithPermissions);
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

            const permissions = await prisma.permission.findMany({
                where: { userId: id }
            });

            return reply.send({ ...user, permissions });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching user' });
        }
    });

    // Create user (admin only)
    fastify.post('/', async (request, reply) => {
        try {
            // @ts-ignore
            const currentUserRole = request.user?.role;
            const currentUserId = request.user?.id;
            
            if (currentUserRole !== 'ADMIN') {
                return reply.status(403).send({ message: 'Only admins can create users' });
            }

            const data = createUserSchema.parse(request.body);
            
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });

            if (existingUser) {
                return reply.status(400).send({ message: 'Email already in use' });
            }

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

            await logActivity(prisma, currentUserId!, 'CREATE_USER', 'Usuários', 
                `Criou novo usuário: ${user.name} (${user.email})`);

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
            const rawData = updateUserSchema.parse(request.body);
            // @ts-ignore
            const currentUserId = request.user?.id;

            // Remove null values and convert to proper format for Prisma
            const data: any = {};
            if (rawData.name !== undefined && rawData.name !== null) data.name = rawData.name;
            if (rawData.email !== undefined && rawData.email !== null) data.email = rawData.email;
            if (rawData.password !== undefined && rawData.password !== null) {
                const bcrypt = require('bcryptjs');
                data.password = await bcrypt.hash(rawData.password, 10);
            }
            if (rawData.role !== undefined && rawData.role !== null) data.role = rawData.role;
            if (rawData.department !== undefined) data.department = rawData.department || null;
            if (rawData.avatar !== undefined) data.avatar = rawData.avatar || null;
            if (rawData.isActive !== undefined && rawData.isActive !== null) data.isActive = rawData.isActive;

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

            await logActivity(prisma, currentUserId!, 'UPDATE_USER', 'Usuários', 
                `Atualizou dados do usuário: ${user.name}`);

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
            // @ts-ignore
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

            await logActivity(prisma, currentUserId!, 'DEACTIVATE_USER', 'Usuários', 
                `Desativou usuário: ${user.name}`);

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
            // @ts-ignore
            const currentUserId = request.user?.id;

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

            await logActivity(prisma, currentUserId!, 'REACTIVATE_USER', 'Usuários', 
                `Reativou usuário: ${user.name}`);

            return reply.send(user);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error reactivating user' });
        }
    });

    // Reset password - send reset email
    fastify.post('/reset-password', async (request, reply) => {
        try {
            const { email } = request.body as { email: string };

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return reply.send({ message: 'Se o email existir, você receberá um link de recuperação' });
            }

            const resetToken = crypto.randomUUID();
            const resetTokenExpires = new Date(Date.now() + 3600000);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    preferences: {
                        ...(user.preferences as object || {}),
                        resetToken,
                        resetTokenExpires
                    }
                }
            });

            const resetLink = `https://sis.arenad65.cloud/reset-password?token=${resetToken}&email=${email}`;
            
            console.log('========== PASSWORD RESET ==========');
            console.log(`Email: ${email}`);
            console.log(`Link: ${resetLink}`);
            console.log('=====================================');

            return reply.send({ message: 'Se o email existir, você receberá um link de recuperação' });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error requesting password reset' });
        }
    });

    // Confirm password reset
    fastify.post('/reset-password/confirm', async (request, reply) => {
        try {
            const { token, email, newPassword } = request.body as { token: string, email: string, newPassword: string };

            const user = await prisma.user.findFirst({
                where: { 
                    email,
                    preferences: {
                        path: ['resetToken'],
                        equals: token
                    }
                }
            });

            if (!user) {
                return reply.status(400).send({ message: 'Token inválido ou expirado' });
            }

            const preferences = user.preferences as any;
            const tokenExpires = preferences?.resetTokenExpires;

            if (!tokenExpires || new Date(tokenExpires) < new Date()) {
                return reply.status(400).send({ message: 'Token expirado' });
            }

            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    preferences: {
                        ...(preferences || {}),
                        resetToken: null,
                        resetTokenExpires: null
                    }
                }
            });

            return reply.send({ message: 'Senha alterada com sucesso!' });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error resetting password' });
        }
    });
}
