import { prisma } from '../lib/prisma';
import { StockMovementType, ProductType } from '../generated/client/client';

export class InventoryService {
    // Registrar entrada de mercadoria
    static async recordStockIn(data: {
        productId: string;
        quantity: number;
        unitCost?: number;
        reason?: string;
        reference?: string;
        userId?: string;
    }) {
        return prisma.$transaction(async (tx) => {
            // 1. Atualizar estoque do produto
            const product = await tx.product.update({
                where: { id: data.productId },
                data: {
                    stock: { increment: data.quantity },
                    purchasePrice: data.unitCost
                }
            });

            // 2. Registrar movimentação
            await tx.stockMovement.create({
                data: {
                    productId: data.productId,
                    type: StockMovementType.IN,
                    quantity: data.quantity,
                    unitCost: data.unitCost,
                    reason: data.reason || 'Entrada de mercadoria',
                    reference: data.reference,
                    userId: data.userId
                }
            });

            return product;
        });
    }

    // Registrar saída por venda (já existe no POSService, mas vamos centralizar)
    static async recordStockOut(data: {
        productId: string;
        quantity: number;
        reason?: string;
        reference?: string;
        userId?: string;
    }) {
        return prisma.$transaction(async (tx) => {
            // 1. Atualizar estoque do produto
            const product = await tx.product.update({
                where: { id: data.productId },
                data: {
                    stock: { decrement: data.quantity }
                }
            });

            // 2. Registrar movimentação
            await tx.stockMovement.create({
                data: {
                    productId: data.productId,
                    type: StockMovementType.OUT,
                    quantity: -data.quantity, // Negativo para saída
                    reason: data.reason || 'Venda',
                    reference: data.reference,
                    userId: data.userId
                }
            });

            return product;
        });
    }

    // Registrar ajuste manual
    static async recordStockAdjustment(data: {
        productId: string;
        quantity: number; // Positivo para aumento, negativo para diminuição
        reason?: string;
        userId?: string;
    }) {
        return prisma.$transaction(async (tx) => {
            // 1. Atualizar estoque do produto
            const product = await tx.product.update({
                where: { id: data.productId },
                data: {
                    stock: { increment: data.quantity }
                }
            });

            // 2. Registrar movimentação
            await tx.stockMovement.create({
                data: {
                    productId: data.productId,
                    type: StockMovementType.ADJ,
                    quantity: data.quantity,
                    reason: data.reason || 'Ajuste manual',
                    userId: data.userId
                }
            });

            return product;
        });
    }

    // Calcular giro mensal de estoque
    static async calculateMonthlyTurnover(productId?: string) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Buscar produtos
        const products = productId 
            ? await prisma.product.findMany({ where: { id: productId } })
            : await prisma.product.findMany({ where: { type: 'PRODUCT' } });

        const turnoverData = [];

        for (const product of products) {
            // Buscar movimentações dos últimos 30 dias
            const movements = await prisma.stockMovement.findMany({
                where: {
                    productId: product.id,
                    createdAt: { gte: thirtyDaysAgo }
                }
            });

            // Calcular total de entradas e saídas
            const totalIn = movements
                .filter(m => m.type === StockMovementType.IN)
                .reduce((sum, m) => sum + m.quantity, 0);

            const totalOut = movements
                .filter(m => m.type === StockMovementType.OUT)
                .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

            // Calcular estoque médio
            const avgStock = (product.stock || 0) + totalIn - totalOut;

            // Calcular giro (saídas / estoque médio)
            const turnover = avgStock > 0 ? (totalOut / avgStock) : 0;

            turnoverData.push({
                productId: product.id,
                productName: product.name,
                currentStock: product.stock || 0,
                totalIn,
                totalOut,
                avgStock,
                turnover: Number((Number(turnover) || 0).toFixed(2))
            });
        }

        return turnoverData;
    }

    // Buscar histórico de movimentações
    static async getStockMovements(filters?: {
        productId?: string;
        type?: StockMovementType;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }) {
        const where: any = {};

        if (filters?.productId) {
            where.productId = filters.productId;
        }

        if (filters?.type) {
            where.type = filters.type;
        }

        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters?.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters?.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }

        return prisma.stockMovement.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: filters?.limit || 100
        });
    }

    // Buscar produtos com estoque crítico
    static async getCriticalStock() {
        return prisma.product.findMany({
            where: {
                type: 'PRODUCT',
                isActive: true,
                stock: { lt: prisma.product.fields.minStock }
            },
            include: { category: true },
            orderBy: { stock: 'asc' }
        });
    }

    // Criar ou atualizar produto
    static async createOrUpdateProduct(data: {
        id?: string;
        name: string;
        description?: string;
        price: number;
        costPrice?: number;
        purchasePrice?: number;
        stock?: number;
        minStock?: number;
        unit?: string;
        sku?: string;
        imageUrl?: string;
        categoryId?: string;
        type?: string;
        isActive?: boolean;
    }) {
        const cleanSku = data.sku?.trim() || null;
        const normalizedPurchasePrice = data.purchasePrice ?? data.costPrice;
        const normalizedCostPrice = data.costPrice ?? data.purchasePrice ?? 0;

        if (data.id) {
            return prisma.product.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    costPrice: normalizedCostPrice,
                    purchasePrice: normalizedPurchasePrice,
                    stock: data.stock,
                    minStock: data.minStock,
                    unit: data.unit,
                    sku: cleanSku,
                    imageUrl: data.imageUrl,
                    categoryId: data.categoryId,
                    type: data.type as ProductType,
                    isActive: data.isActive
                },
                include: { category: true }
            });
        } else {
            return prisma.product.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    costPrice: normalizedCostPrice,
                    purchasePrice: normalizedPurchasePrice,
                    stock: data.stock || 0,
                    minStock: data.minStock || 5,
                    unit: data.unit || 'UN',
                    sku: cleanSku,
                    imageUrl: data.imageUrl,
                    categoryId: data.categoryId,
                    type: (data.type || 'PRODUCT') as ProductType,
                    isActive: data.isActive !== undefined ? data.isActive : true
                },
                include: { category: true }
            });
        }
    }
}
