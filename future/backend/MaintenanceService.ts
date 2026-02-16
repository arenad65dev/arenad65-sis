
import { prisma } from '../lib/prisma';

export class MaintenanceService {
    static async findAll() {
        return prisma.maintenance.findMany({
            orderBy: { date: 'asc' }
        });
    }

    static async create(data: { title: string; date: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; status?: string }) {
        return prisma.maintenance.create({
            data: {
                title: data.title,
                date: new Date(data.date),
                priority: data.priority,
                status: data.status || 'PENDING'
            }
        });
    }

    static async update(id: string, data: { status?: string; title?: string; date?: string; priority?: string }) {
        return prisma.maintenance.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined
            }
        });
    }

    static async delete(id: string) {
        return prisma.maintenance.delete({
            where: { id }
        });
    }
}
