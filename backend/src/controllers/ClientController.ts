import { FastifyReply, FastifyRequest } from 'fastify';
import { ClientService } from '../services/ClientService';
import { clientSchema } from '../utils/ClientUtils';

export class ClientController {

    static async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = clientSchema.parse(request.body);
            const client = await ClientService.create(data);
            return reply.status(201).send(client);
        } catch (error: any) {
            return reply.status(400).send({ message: error.message || 'Erro ao criar cliente' });
        }
    }

    static async list(request: FastifyRequest<{ Querystring: { search?: string } }>, reply: FastifyReply) {
        try {
            const { search } = request.query;
            const clients = await ClientService.list(search);
            return reply.send(clients);
        } catch (error: any) {
            return reply.status(500).send({ message: 'Erro ao listar clientes' });
        }
    }

    static async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const client = await ClientService.getById(id);
            if (!client) return reply.status(404).send({ message: 'Cliente não encontrado' });
            return reply.send(client);
        } catch (error: any) {
            return reply.status(500).send({ message: 'Erro ao buscar cliente' });
        }
    }
}
