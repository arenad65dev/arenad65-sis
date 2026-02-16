import { prisma } from '../lib/prisma';
import { CreateClientDTO } from '../utils/ClientUtils';

export class ClientService {

    static async create(data: CreateClientDTO) {
        if (data.cpf) {
            const existing = await prisma.client.findUnique({ where: { cpf: data.cpf } });
            if (existing) throw new Error('CPF já cadastrado');
        }

        return prisma.client.create({
            data: {
                name: data.name,
                cpf: data.cpf || null,
                phone: data.phone,
                email: data.email || null
            }
        });
    }

    static async list(search?: string) {
        if (!search) {
            return prisma.client.findMany({
                orderBy: { name: 'asc' },
                take: 50
            });
        }

        return prisma.client.findMany({
            where: {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { cpf: { contains: search } }
                ]
            },
            orderBy: { name: 'asc' },
            take: 20
        });
    }

    static async getById(id: string) {
        return prisma.client.findUnique({
            where: { id },
            include: {
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
}
