
import { FastifyReply, FastifyRequest } from 'fastify';
import { MaintenanceService } from '../services/MaintenanceService';

export class MaintenanceController {
    static async getAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            const items = await MaintenanceService.findAll();
            return reply.send(items);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching maintenance tasks' });
        }
    }

    static async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = request.body as any;
            const newItem = await MaintenanceService.create(data);
            return reply.status(201).send(newItem);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error creating task' });
        }
    }

    static async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const data = request.body as any;
            const updated = await MaintenanceService.update(id, data);
            return reply.send(updated);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error updating task' });
        }
    }

    static async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            await MaintenanceService.delete(id);
            return reply.send({ success: true });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error deleting task' });
        }
    }
}
