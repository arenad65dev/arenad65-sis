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

    static async payOrder(orderId: string, paymentMethod: PaymentMethod, userId?: string, paidAmount?: number) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                transactions: true
            }
        });
        if (!order) throw new Error('Order not found');
        if (order.status === OrderStatus.PAID) throw new Error('Order already paid');

        const alreadyPaid = order.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const orderTotal = Number(order.totalAmount);
        const remainingAmount = Math.max(orderTotal - alreadyPaid, 0);
        if (remainingAmount <= 0) throw new Error('Order already settled');

        const amountToCharge = paidAmount ?? remainingAmount;
        if (amountToCharge <= 0) throw new Error('Paid amount must be greater than zero');
        if (amountToCharge > remainingAmount) throw new Error('Paid amount cannot exceed remaining balance');
        const isFinalPayment = amountToCharge === remainingAmount;

        // Find ANY open cashier session (shared cashier support)
        let cashierSessionId: string | undefined;
        const session = await prisma.cashierSession.findFirst({
            where: { status: 'OPEN' }
        });
        if (session) cashierSessionId = session.id;

        return prisma.$transaction(async (tx) => {
            // 1. Create Financial Transaction
            await tx.transaction.create({
                data: {
                    type: 'INCOME',
                    amount: amountToCharge,
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
                    data: { totalSales: { increment: amountToCharge } }
                });
            }

            // 3. Decrement stock only once (on first payment)
            if (alreadyPaid === 0) {
                for (const item of order.items) {
                    if (item.product.type === 'PRODUCT') {
                        const product = await tx.product.findUnique({
                            where: { id: item.productId }
                        });

                        if (!product) {
                            throw new Error(`Product ${item.productId} not found`);
                        }

                        if (product.stock < item.quantity) {
                            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
                        }

                        await InventoryService.recordStockOut({
                            productId: item.productId,
                            quantity: item.quantity,
                            reason: `Venda - Pedido #${order.number}`,
                            reference: order.id,
                            userId: order.userId || undefined
                        });
                    }
                }
            }

            // 4. Close order only when fully paid
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    ...(isFinalPayment ? { status: OrderStatus.PAID, closedAt: new Date() } : {})
                }
            });

            return {
                order: updatedOrder,
                paidAmount: amountToCharge,
                remainingAmount: Number((remainingAmount - amountToCharge).toFixed(2)),
                isPaid: isFinalPayment
            };
        });
    }
}
