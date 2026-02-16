import { FastifyReply, FastifyRequest } from 'fastify';
import { POSService } from '../services/POSService';
import { z } from 'zod';

const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1)
    })).min(1)
});

const payOrderSchema = z.object({
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'TRANSFER', 'TAB'])
});

export class POSController {

    static async getProducts(request: FastifyRequest<{ Querystring: { search?: string, categoryId?: string } }>, reply: FastifyReply) {
        try {
            const { search, categoryId } = request.query;
            const products = await POSService.getProducts(search, categoryId);
            return reply.send(products);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching products' });
        }
    }

    static async createOrder(request: FastifyRequest, reply: FastifyReply) {
        try {
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            const data = createOrderSchema.parse(request.body);

            const order = await POSService.createOrder({ userId, items: data.items });
            return reply.status(201).send(order);
        } catch (error) {
            request.log.error(error);

            // Handle stock errors specifically
            if (error instanceof Error && error.message.includes('Insufficient stock')) {
                return reply.status(400).send({
                    message: 'Estoque insuficiente',
                    details: error.message
                });
            }

            // Handle product not found errors
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.status(404).send({
                    message: 'Produto não encontrado',
                    details: error.message
                });
            }

            return reply.status(400).send({ message: 'Erro ao criar pedido' });
        }
    }

    static async payOrder(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const { paymentMethod } = payOrderSchema.parse(request.body);
            // @ts-ignore - JWT user
            const userId = request.user?.id;

            const result = await POSService.payOrder(id, paymentMethod, userId);
            return reply.send(result);
        } catch (error) {
            request.log.error(error);

            // Handle stock errors specifically
            if (error instanceof Error && error.message.includes('Insufficient stock')) {
                return reply.status(400).send({
                    message: 'Estoque insuficiente',
                    details: error.message
                });
            }

            // Handle order not found errors
            if (error instanceof Error && error.message.includes('Order not found')) {
                return reply.status(404).send({
                    message: 'Pedido não encontrado',
                    details: error.message
                });
            }

            // Handle already paid errors
            if (error instanceof Error && error.message.includes('Order already paid')) {
                return reply.status(400).send({
                    message: 'Pedido já foi pago',
                    details: error.message
                });
            }

            return reply.status(400).send({ message: 'Erro ao processar pagamento' });
        }
    }
}
