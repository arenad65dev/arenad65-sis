import { FastifyReply, FastifyRequest } from 'fastify';
import { POSService } from '../services/POSService';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1)
    })).min(1)
});

const payOrderSchema = z.object({
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'TRANSFER', 'TAB']),
    paidAmount: z.preprocess((v) => v == null ? undefined : Number(v), z.number().positive().optional())
});

const updateProductSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    minStock: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    imageUrl: z.string().optional()
});

export class POSController {

    static async getCategories(request: FastifyRequest, reply: FastifyReply) {
        try {
            const categories = await prisma.category.findMany({
                where: { type: 'PRODUCT' },
                orderBy: { name: 'asc' }
            });
            return reply.send(categories);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching categories' });
        }
    }

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

    static async getProduct(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const product = await prisma.product.findUnique({
                where: { id },
                include: { category: true }
            });
            
            if (!product) {
                return reply.status(404).send({ message: 'Product not found' });
            }
            
            return reply.send(product);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching product' });
        }
    }

    static async updateProduct(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const data = updateProductSchema.parse(request.body);

            const product = await prisma.product.update({
                where: { id },
                data,
                include: { category: true }
            });

            return reply.send(product);
        } catch (error) {
            request.log.error(error);
            
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ 
                    message: 'Validation error', 
                    errors: error.issues 
                });
            }
            
            return reply.status(500).send({ message: 'Error updating product' });
        }
    }

    static async getOrders(request: FastifyRequest<{ Querystring: { status?: string, startDate?: string, endDate?: string, limit?: string } }>, reply: FastifyReply) {
        try {
            const { status, startDate, endDate, limit } = request.query;
            
            const where: any = {};
            
            if (status) {
                where.status = status;
            }
            
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }

            const orders = await prisma.order.findMany({
                where,
                include: {
                    items: { include: { product: true } },
                    user: { select: { id: true, name: true } },
                    client: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit ? parseInt(limit) : 50
            });

            return reply.send(orders);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching orders' });
        }
    }

    static async getOrder(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const order = await prisma.order.findUnique({
                where: { id },
                include: {
                    items: { include: { product: true } },
                    user: { select: { id: true, name: true } },
                    client: true,
                    transactions: true
                }
            });

            if (!order) {
                return reply.status(404).send({ message: 'Order not found' });
            }

            return reply.send(order);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching order' });
        }
    }

    static async getSalesReport(request: FastifyRequest<{ Querystring: { startDate?: string, endDate?: string, groupBy?: string } }>, reply: FastifyReply) {
        try {
            const { startDate, endDate, groupBy } = request.query;
            
            const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
            const end = endDate ? new Date(endDate) : new Date();

            // Get all paid orders in date range
            const orders = await prisma.order.findMany({
                where: {
                    status: 'PAID',
                    closedAt: {
                        gte: start,
                        lte: end
                    }
                },
                include: {
                    items: { include: { product: true } },
                    transactions: true
                }
            });

            // Calculate totals
            let totalRevenue = 0;
            let totalOrders = orders.length;
            const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
            const paymentMethods: Record<string, number> = {};

            for (const order of orders) {
                totalRevenue += Number(order.totalAmount);
                
                // Product breakdown
                for (const item of order.items) {
                    const productName = item.product.name;
                    if (!productSales[productName]) {
                        productSales[productName] = { name: productName, quantity: 0, revenue: 0 };
                    }
                    productSales[productName].quantity += item.quantity;
                    productSales[productName].revenue += Number(item.price) * item.quantity;
                }

                // Payment methods
                for (const tx of order.transactions) {
                    const method = tx.paymentMethod || 'UNKNOWN';
                    paymentMethods[method] = (paymentMethods[method] || 0) + Number(tx.amount);
                }
            }

            // Get top products
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            return reply.send({
                period: { start, end },
                summary: {
                    totalRevenue,
                    totalOrders,
                    averageTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0
                },
                topProducts,
                paymentMethods,
                orders: orders.map(o => ({
                    id: o.id,
                    number: o.number,
                    totalAmount: o.totalAmount,
                    closedAt: o.closedAt,
                    paymentMethod: o.transactions[0]?.paymentMethod
                }))
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error generating report' });
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
            const { paymentMethod, paidAmount } = payOrderSchema.parse(request.body);
            // @ts-ignore - JWT user
            const userId = request.user?.id;

            const result = await POSService.payOrder(id, paymentMethod, userId, paidAmount);
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
