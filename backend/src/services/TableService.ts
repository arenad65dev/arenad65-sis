import { prisma } from '../lib/prisma';
import { OrderStatus } from '../generated/client/client';

export class TableService {
    // Abrir mesa (criar um pedido em aberto para a mesa)
    static async openTable(data: { tableNumber: string, userId?: string, clientId?: string }) {
        // Verificar se já existe uma mesa aberta
        const existingTable = await prisma.order.findFirst({
            where: {
                tableNumber: data.tableNumber,
                status: OrderStatus.OPEN
            }
        });

        if (existingTable) {
            throw new Error(`Mesa ${data.tableNumber} já está aberta`);
        }

        // Criar um novo pedido para a mesa
        return prisma.order.create({
            data: {
                tableNumber: data.tableNumber,
                status: OrderStatus.OPEN,
                totalAmount: 0,
                userId: data.userId,
                clientId: data.clientId
            },
            include: {
                items: {
                    include: { product: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                },
                client: true
            }
        });
    }

    // Adicionar itens à mesa
    static async addItemsToTable(tableNumber: string, items: { productId: string, quantity: number }[]) {
        const table = await prisma.order.findFirst({
            where: {
                tableNumber,
                status: OrderStatus.OPEN
            },
            include: { items: true }
        });

        if (!table) {
            throw new Error(`Mesa ${tableNumber} não está aberta`);
        }

        // Verificar estoque e calcular total
        let totalAmount = Number(table.totalAmount);
        const orderItemsData = [];
        const outOfStockItems: string[] = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Produto ${item.productId} não encontrado`);

            if (product.type === 'PRODUCT' && product.stock < item.quantity) {
                outOfStockItems.push(`${product.name} (disponível: ${product.stock}, solicitado: ${item.quantity})`);
            }

            const price = Number(product.price);
            totalAmount += price * item.quantity;

            // Verificar se o item já existe no pedido
            const existingItem = table.items.find(i => i.productId === item.productId);

            if (existingItem) {
                // Atualizar quantidade
                await prisma.orderItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + item.quantity }
                });
            } else {
                // Adicionar novo item
                orderItemsData.push({
                    orderId: table.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: price
                });
            }
        }

        if (outOfStockItems.length > 0) {
            throw new Error(`Estoque insuficiente para: ${outOfStockItems.join(', ')}`);
        }

        // Criar novos itens se necessário
        if (orderItemsData.length > 0) {
            await prisma.orderItem.createMany({
                data: orderItemsData
            });
        }

        // Atualizar total do pedido
        return prisma.order.update({
            where: { id: table.id },
            data: { totalAmount },
            include: {
                items: {
                    include: { product: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                },
                client: true
            }
        });
    }

    // Sincronizar itens da mesa com estado final (inclui remoções)
    static async syncItemsToTable(
        tableNumber: string,
        items: { productId: string, quantity: number }[],
        clientId?: string,
        ownerName?: string
    ) {
        const table = await prisma.order.findFirst({
            where: {
                tableNumber,
                status: OrderStatus.OPEN
            },
            include: { items: true }
        });

        if (!table) {
            throw new Error(`Mesa ${tableNumber} não está aberta`);
        }

        const outOfStockItems: string[] = [];
        let totalAmount = 0;
        const incomingMap = new Map(items.map((item) => [item.productId, item.quantity]));
        const existingMap = new Map(table.items.map((item) => [item.productId, item]));

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Produto ${item.productId} não encontrado`);

            if (product.type === 'PRODUCT' && product.stock < item.quantity) {
                outOfStockItems.push(`${product.name} (disponível: ${product.stock}, solicitado: ${item.quantity})`);
            }

            totalAmount += Number(product.price) * item.quantity;
        }

        if (outOfStockItems.length > 0) {
            throw new Error(`Estoque insuficiente para: ${outOfStockItems.join(', ')}`);
        }

        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) continue;

                const existing = existingMap.get(item.productId);
                if (existing) {
                    await tx.orderItem.update({
                        where: { id: existing.id },
                        data: {
                            quantity: item.quantity,
                            price: Number(product.price)
                        }
                    });
                } else {
                    await tx.orderItem.create({
                        data: {
                            orderId: table.id,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: Number(product.price)
                        }
                    });
                }
            }

            for (const existing of table.items) {
                if (!incomingMap.has(existing.productId)) {
                    await tx.orderItem.delete({
                        where: { id: existing.id }
                    });
                }
            }

            await tx.order.update({
                where: { id: table.id },
                data: {
                    totalAmount,
                    ...(clientId !== undefined ? { clientId: clientId || null } : {}),
                    ...(ownerName !== undefined ? { notes: `OWNER:${ownerName}` } : {})
                }
            });
        });

        return prisma.order.findUnique({
            where: { id: table.id },
            include: {
                items: {
                    include: { product: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                },
                client: true
            }
        });
    }

    // Fechar mesa (finalizar pedido)
    static async closeTable(tableNumber: string, paymentData?: { paymentMethod: string, paidAmount?: number, clientId?: string }, userId?: string) {
        const table = await prisma.order.findFirst({
            where: {
                tableNumber,
                status: OrderStatus.OPEN
            },
            include: {
                items: { include: { product: true } },
                user: true,
                transactions: true
            }
        });

        if (!table) {
            throw new Error(`Mesa ${tableNumber} não está aberta`);
        }

        // Find ANY open cashier session (shared cashier support)
        let cashierSessionId: string | undefined;
        const session = await prisma.cashierSession.findFirst({
            where: { status: 'OPEN' }
        });
        if (session) cashierSessionId = session.id;

        const alreadyPaid = table.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const totalAmount = Number(table.totalAmount);
        const remainingAmount = Math.max(totalAmount - alreadyPaid, 0);
        if (remainingAmount <= 0) throw new Error(`Mesa ${tableNumber} já está quitada`);

        return prisma.$transaction(async (tx) => {
            if (paymentData) {
                const amount = paymentData.paidAmount ?? remainingAmount;
                if (amount <= 0) throw new Error('Valor pago deve ser maior que zero');
                if (amount > remainingAmount) throw new Error('Valor pago não pode ser maior que o saldo pendente');

                await tx.transaction.create({
                    data: {
                        type: 'INCOME',
                        amount: amount,
                        description: `Pagamento Mesa ${tableNumber} - Pedido #${table.number}`,
                        orderId: table.id,
                        paymentMethod: paymentData.paymentMethod as any,
                        cashierId: cashierSessionId
                    }
                });

                // Update Cashier Sales Total
                if (cashierSessionId) {
                    await tx.cashierSession.update({
                        where: { id: cashierSessionId },
                        data: { totalSales: { increment: amount } }
                    });
                }

                // Dar baixa no estoque só na primeira cobrança
                if (alreadyPaid === 0) {
                    for (const item of table.items) {
                        if (item.product.type === 'PRODUCT') {
                            const product = await tx.product.findUnique({
                                where: { id: item.productId }
                            });

                            if (!product) {
                                throw new Error(`Produto ${item.productId} não encontrado`);
                            }

                            if (product.stock < item.quantity) {
                                throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`);
                            }

                            // Usar o InventoryService herdando o contexto da transação (tx)
                            // Nota: O InventoryService atual usa o prisma global, então precisamos garantir consistência
                            // No entanto, por simplicidade agora vamos manter o padrão do POSService
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { decrement: item.quantity } }
                            });

                            await tx.stockMovement.create({
                                data: {
                                    productId: item.productId,
                                    type: 'OUT',
                                    quantity: -item.quantity,
                                    unitCost: Number(item.product.costPrice || 0),
                                    reason: `Venda - Mesa ${tableNumber}`,
                                    reference: table.id,
                                    userId: userId || undefined
                                }
                            });
                        }
                    }
                }

                const isFinalPayment = amount === remainingAmount;
                const updatedOrder = await tx.order.update({
                    where: { id: table.id },
                    data: {
                        ...(isFinalPayment ? { status: OrderStatus.PAID, closedAt: new Date() } : {}),
                        clientId: paymentData.clientId
                    },
                    include: {
                        items: { include: { product: true } },
                        user: {
                            select: { id: true, name: true, email: true }
                        },
                        client: true,
                        transactions: true
                    }
                });

                return {
                    order: updatedOrder,
                    paidAmount: amount,
                    remainingAmount: Number((remainingAmount - amount).toFixed(2)),
                    isPaid: isFinalPayment
                };
            }

            return tx.order.findUnique({
                where: { id: table.id },
                include: {
                    items: { include: { product: true } },
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    client: true,
                    transactions: true
                }
            });
        });
    }

    // Transferir mesa
    static async transferTable(fromTableNumber: string, toTableNumber: string) {
        const fromTable = await prisma.order.findFirst({
            where: {
                tableNumber: fromTableNumber,
                status: OrderStatus.OPEN
            }
        });

        if (!fromTable) {
            throw new Error(`Mesa ${fromTableNumber} não está aberta`);
        }

        const toTable = await prisma.order.findFirst({
            where: {
                tableNumber: toTableNumber,
                status: OrderStatus.OPEN
            }
        });

        if (toTable) {
            throw new Error(`Mesa ${toTableNumber} já está aberta`);
        }

        // Transferir itens
        return prisma.$transaction(async (tx) => {
            // Atualizar número da mesa
            await tx.order.update({
                where: { id: fromTable.id },
                data: { tableNumber: toTableNumber }
            });

            // Buscar mesa atualizada
            return tx.order.findUnique({
                where: { id: fromTable.id },
                include: {
                    items: { include: { product: true } },
                    user: true
                }
            });
        });
    }

    // Listar mesas abertas
    static async getOpenTables() {
        return prisma.order.findMany({
            where: {
                status: OrderStatus.OPEN,
                tableNumber: { not: null }
            },
            include: {
                items: {
                    include: { product: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                },
                client: true,
                transactions: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }

    // Buscar mesa específica
    static async getTable(tableNumber: string) {
        return prisma.order.findFirst({
            where: {
                tableNumber,
                status: OrderStatus.OPEN
            },
            include: {
                items: {
                    include: { product: true }
                },
                user: {
                    select: { id: true, name: true, email: true }
                },
                client: true,
                transactions: true
            }
        });
    }

    // Cancelar mesa
    static async cancelTable(tableNumber: string, reason?: string) {
        const table = await prisma.order.findFirst({
            where: {
                tableNumber,
                status: OrderStatus.OPEN
            }
        });

        if (!table) {
            throw new Error(`Mesa ${tableNumber} não está aberta`);
        }

        return prisma.order.update({
            where: { id: table.id },
            data: {
                status: OrderStatus.CANCELLED,
                closedAt: new Date(),
                notes: reason
            }
        });
    }
}
