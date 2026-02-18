import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { PasswordUtils } from '../utils/password';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
});

const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CASHIER', 'WAITER']).optional(),
});

export class AuthController {

    static async login(request: FastifyRequest, reply: FastifyReply) {
        const { email, password } = loginSchema.parse(request.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return reply.code(401).send({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return reply.code(401).send({ message: 'User account is deactivated' });
        }

        const isPasswordValid = await PasswordUtils.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return reply.code(401).send({ message: 'Invalid credentials' });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        const token = await reply.jwtSign({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return reply.send({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                department: user.department
            } 
        });
    }

    static async register(request: FastifyRequest, reply: FastifyReply) {
        const data = registerSchema.parse(request.body);

        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return reply.code(400).send({ message: 'User already exists' });
        }

        const hashedPassword = await PasswordUtils.hashPassword(data.password);
        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword
            }
        });

        const token = await reply.jwtSign({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return reply.code(201).send({ token, user: { id: user.id, name: user.name, role: user.role } });
    }

    static async me(request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
            return reply.send({ user: request.user });
        } catch (err) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
    }

    static async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        await request.jwtVerify();
        const user = request.user as { id: string };

        const updateSchema = z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            avatar: z.string().optional(),
            preferences: z.object({
                notifications: z.boolean(),
                sound: z.boolean(),
                weeklyReport: z.boolean(),
                autoTheme: z.boolean(),
            }).optional(),
            currentPassword: z.string().optional(),
            newPassword: z.string().min(6).optional(),
        });

        const data = updateSchema.parse(request.body);

        // If changing password, validate current password first
        if (data.newPassword) {
            if (!data.currentPassword) {
                return reply.code(400).send({ message: 'Current password is required to change password' });
            }

            const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
            if (!currentUser) {
                return reply.code(404).send({ message: 'User not found' });
            }

            const isCurrentPasswordValid = await PasswordUtils.comparePassword(
                data.currentPassword, 
                currentUser.password
            );
            
            if (!isCurrentPasswordValid) {
                return reply.code(401).send({ message: 'Current password is incorrect' });
            }
        }

        const updateData: any = {
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            preferences: data.preferences ?? undefined,
        };

        if (data.newPassword) {
            updateData.password = await PasswordUtils.hashPassword(data.newPassword);
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData
        });

        return reply.send({
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                preferences: updatedUser.preferences
            }
        });
    }
}
