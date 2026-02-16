import { prisma } from '../lib/prisma';
import { OrderStatus, PaymentMethod } from '../generated/client/client';
import { InventoryService } from './InventoryService';

export class POSService {
    static async getProducts(search?: string, categoryId?: string) {
        return prisma.product.findMany({
            where: {
                isActive: true,
                ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
                ...(categoryId ? { category: { name: categoryId } } : {})
            },
            include: { category: true }
        });
    }

    static async createOrder(data: { userId?: string, clientId?: string, items: { productId: string, quantity: number }[] }) {
        // 1. Validate stock availability and calculate total
        let totalAmount = 0;
        const orderItemsData = [];
        const outOfStockItems: string[] = [];

        for (const item of data.items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product ${item.productId} not found`);

            // Check if product has enough stock
            if (product.type === 'PRODUCT' && product.stock < item.quantity) {
                outOfStockItems.push(`${product.name} (available: ${product.stock}, requested: ${item.quantity})`);
            }

            const price = Number(product.price);
            totalAmount += price * item.quantity;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: price // Snapshot price
            });
        }

        // If any items are out of stock, throw an error
        if (outOfStockItems.length > 0) {
            throw new Error(`Insufficient stock for: ${outOfStockItems.join(', ')}`);
        }

        // 2. Create Order
        return prisma.order.create({
            data: {
                userId: data.userId,
                clientId: data.clientId,
                status: OrderStatus.OPEN,
                totalAmount,
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
    }

    static async payOrder(orderId: string, paymentMethod: PaymentMethod, userId?: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } }
        });
        if (!order) throw new Error('Order not found');
        if (order.status === OrderStatus.PAID) throw new Error('Order already paid');

        // Find open cashier session if userId provided
        let cashierSessionId: string | undefined;
        if (userId) {
            const session = await prisma.cashierSession.findFirst({
                where: { userId, status: 'OPEN' }
            });
            if (session) cashierSessionId = session.id;
        }

        return prisma.$transaction(async (tx) => {
            // 1. Update Order Status
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.PAID,
                    closedAt: new Date()
                }
            });

            // 2. Create Financial Transaction
            await tx.transaction.create({
                data: {
                    type: 'INCOME',
                    amount: order.totalAmount,
                    description: `Order #${order.number}`,
                    orderId: order.id,
                    paymentMethod: paymentMethod,
                    cashierId: cashierSessionId
                }
            });

            // Update Cashier Sales Total
            if (cashierSessionId) {
                await tx.cashierSession.update({
                    where: { id: cashierSessionId },
                    data: { totalSales: { increment: order.totalAmount } }
                });
            }

            // 3. Decrement Inventory for products
            for (const item of order.items) {
                // Only decrement stock for products, not services or rentals
                if (item.product.type === 'PRODUCT') {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId }
                    });

                    if (!product) {
                        throw new Error(`Product ${item.productId} not found`);
                    }

                    // Double-check stock before decrementing
                    if (product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
                    }

                    // Decrement stock and record movement
                    await InventoryService.recordStockOut({
                        productId: item.productId,
                        quantity: item.quantity,
                        reason: `Venda - Pedido #${order.number}`,
                        reference: order.id,
                        userId: order.userId || undefined
                    });
                }
            }

            return updatedOrder;
        });
    }
}
