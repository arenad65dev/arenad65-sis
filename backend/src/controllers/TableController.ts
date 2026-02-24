import { FastifyReply, FastifyRequest } from 'fastify';
import { TableService } from '../services/TableService';
import { z } from 'zod';

const openTableSchema = z.object({
    tableNumber: z.string().min(1),
    clientId: z.string().optional()
});

const addItemsSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1)
    })).min(1)
});

const syncItemsSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().min(1)
    })),
    clientId: z.string().optional(),
    ownerName: z.string().trim().min(1).optional()
});

const closeTableSchema = z.object({
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'TRANSFER', 'TAB']),
    paidAmount: z.preprocess((v) => v == null ? undefined : Number(v), z.number().positive().optional())
});

const transferTableSchema = z.object({
    toTableNumber: z.string().min(1)
});

export class TableController {

    static async getOpenTables(request: FastifyRequest, reply: FastifyReply) {
        try {
            const tables = await TableService.getOpenTables();
            return reply.send(tables);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao buscar mesas abertas' });
        }
    }

    static async getTable(request: FastifyRequest<{ Params: { tableNumber: string } }>, reply: FastifyReply) {
        try {
            const { tableNumber } = request.params;
            const table = await TableService.getTable(tableNumber);

            if (!table) {
                return reply.status(404).send({ message: 'Mesa não encontrada ou não está aberta' });
            }

            return reply.send(table);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao buscar mesa' });
        }
    }

    static async openTable(request: FastifyRequest, reply: FastifyReply) {
        try {
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            const data = openTableSchema.parse(request.body);

            const table = await TableService.openTable({ ...data, userId });
            return reply.status(201).send(table);
        } catch (error) {
            request.log.error(error);

            if (error instanceof Error && error.message.includes('já está aberta')) {
                return reply.status(400).send({
                    message: 'Mesa já está aberta',
                    details: error.message
                });
            }

            return reply.status(400).send({ message: 'Erro ao abrir mesa' });
        }
    }

    static async addItemsToTable(request: FastifyRequest<{ Params: { tableNumber: string } }>, reply: FastifyReply) {
        try {
            const { tableNumber } = request.params;
            const data = addItemsSchema.parse(request.body);

            const table = await TableService.addItemsToTable(tableNumber, data.items);
            return reply.send(table);
        } catch (error) {
            request.log.error(error);

            if (error instanceof Error && error.message.includes('não está aberta')) {
                return reply.status(400).send({
                    message: 'Mesa não está aberta',
                    details: error.message
                });
            }

            if (error instanceof Error && error.message.includes('Estoque insuficiente')) {
                return reply.status(400).send({
                    message: 'Estoque insuficiente',
                    details: error.message
                });
            }

            return reply.status(400).send({ message: 'Erro ao adicionar itens à mesa' });
        }
    }

    static async syncItemsToTable(request: FastifyRequest<{ Params: { tableNumber: string } }>, reply: FastifyReply) {
        try {
            const { tableNumber } = request.params;
            const data = syncItemsSchema.parse(request.body);

            const table = await TableService.syncItemsToTable(tableNumber, data.items, data.clientId, data.ownerName);
            return reply.send(table);
        } catch (error) {
            request.log.error(error);

            if (error instanceof Error && error.message.includes('não está aberta')) {
                return reply.status(400).send({
                    message: 'Mesa não está aberta',
                    details: error.message
                });
            }

            if (error instanceof Error && error.message.includes('Estoque insuficiente')) {
                return reply.status(400).send({
                    message: 'Estoque insuficiente',
                    details: error.message
                });
            }

            return reply.status(400).send({ message: 'Erro ao sincronizar itens da mesa' });
        }
    }

    static async closeTable(request: FastifyRequest<{ Params: { tableNumber: string } }>, reply: FastifyReply) {
        try {
            const { tableNumber } = request.params;
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            const data = closeTableSchema.parse(request.body);

            const result = await TableService.closeTable(tableNumber, data, userId);
            return reply.send(result);
        } catch (error) {
            request.log.error(error);

            if (error instanceof Error && error.message.includes('não está aberta')) {
                return reply.status(400).send({
                    message: 'Mesa não está aberta',
                    details: error.message
                });
            }

            return reply.status(400).send({ message: 'Erro ao fechar mesa' });
        }
    }

    static async transferTable(request: FastifyRequest<{ Params: { tableNumber: string } }>, reply: FastifyReply) {
        try {
            const { tableNumber } = request.params;
            const data = transferTableSchema.parse(request.body);

            const table = await TableService.transferTable(tableNumber, data.toTableNumber);
            return reply.send(table);
        } catch (error) {
            request.log.error(error);

            if (error instanceof Error && error.message.includes('não está aberta')) {
                return reply.status(400).send({
                    message: 'Mesa de origem não está aberta',
                    details: error.message
                });
            }

            if (error instanceof Error && error.message.includes('já está aberta')) {
                return reply.status(400).send({
                    message: 'Mesa de destino já está aberta',
                    details: error.message
                });
            }

            return reply.status(400).send({ message: 'Erro ao transferir mesa' });
        }
    }

    static async cancelTable(request: FastifyRequest<{ Params: { tableNumber: string } }>, reply: FastifyReply) {
        try {
            const { tableNumber } = request.params;
            const { reason } = request.body as { reason?: string };

            const table = await TableService.cancelTable(tableNumber, reason);
            return reply.send(table);
        } catch (error) {
            request.log.error(error);

            if (error instanceof Error && error.message.includes('não está aberta')) {
                return reply.status(400).send({
                    message: 'Mesa não está aberta',
                    details: error.message
                });
            }

            return reply.status(400).send({ message: 'Erro ao cancelar mesa' });
        }
    }
}
