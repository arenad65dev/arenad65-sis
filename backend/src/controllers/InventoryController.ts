import { FastifyReply, FastifyRequest } from 'fastify';
import { InventoryService } from '../services/InventoryService';
import { prisma } from '../lib/prisma';
import { StorageService } from '../lib/storage';
import { z } from 'zod';

const purchaseOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        cost: z.number().min(0)
    })).min(1),
    reason: z.string().optional(),
    reference: z.string().optional()
});

const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.preprocess((v) => Number(v), z.number().min(0)),
    costPrice: z.preprocess((v) => v == null ? undefined : Number(v), z.number().min(0).optional()),
    purchasePrice: z.preprocess((v) => v == null ? undefined : Number(v), z.number().min(0).optional()),
    stock: z.preprocess((v) => v == null ? undefined : Number(v), z.number().min(0).optional()),
    minStock: z.preprocess((v) => v == null ? undefined : Number(v), z.number().min(0).optional()),
    unit: z.string().optional(),
    sku: z.string().optional(),
    imageUrl: z.string().optional(),
    categoryId: z.string().optional(),
    type: z.enum(['PRODUCT', 'SERVICE', 'RENTAL']).optional(),
    isActive: z.preprocess((v) => v == null ? undefined : Boolean(v), z.boolean().optional())
});

const stockAdjustmentSchema = z.object({
    productId: z.string(),
    quantity: z.number(), // Positivo ou negativo
    reason: z.string().optional()
});

export class InventoryController {

    // Registrar entrada de mercadoria (purchase order)
    static async recordPurchaseOrder(request: FastifyRequest, reply: FastifyReply) {
        try {
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            const data = purchaseOrderSchema.parse(request.body);

            const results = [];
            for (const item of data.items) {
                const result = await InventoryService.recordStockIn({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.cost,
                    reason: data.reason || 'Entrada de mercadoria',
                    reference: data.reference,
                    userId
                });
                results.push(result);
            }

            return reply.send({ 
                message: 'Entrada de mercadoria registrada com sucesso',
                items: results 
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(400).send({ 
                message: 'Erro ao registrar entrada de mercadoria',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Criar ou atualizar produto
    static async createOrUpdateProduct(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = productSchema.parse(request.body);
            const product = await InventoryService.createOrUpdateProduct(data);
            
            return reply.send({
                message: data.id ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso',
                product
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(400).send({ 
                message: 'Erro ao salvar produto',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Ajuste manual de estoque
    static async adjustStock(request: FastifyRequest, reply: FastifyReply) {
        try {
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            const data = stockAdjustmentSchema.parse(request.body);

            const product = await InventoryService.recordStockAdjustment({
                productId: data.productId,
                quantity: data.quantity,
                reason: data.reason || 'Ajuste manual',
                userId
            });

            return reply.send({
                message: 'Estoque ajustado com sucesso',
                product
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(400).send({ 
                message: 'Erro ao ajustar estoque',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Buscar histórico de movimentações
    static async getStockMovements(request: FastifyRequest<{ Querystring: { 
        productId?: string; 
        type?: string; 
        startDate?: string; 
        endDate?: string; 
        limit?: string; 
    } }>, reply: FastifyReply) {
        try {
            const { productId, type, startDate, endDate, limit } = request.query;

            const filters: any = {};
            if (productId) filters.productId = productId;
            if (type) filters.type = type as any;
            if (startDate) filters.startDate = new Date(startDate);
            if (endDate) filters.endDate = new Date(endDate);
            if (limit) filters.limit = parseInt(limit);

            const movements = await InventoryService.getStockMovements(filters);
            return reply.send(movements);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao buscar movimentações' });
        }
    }

    // Calcular giro mensal
    static async getMonthlyTurnover(request: FastifyRequest<{ Querystring: { productId?: string } }>, reply: FastifyReply) {
        try {
            const { productId } = request.query;
            const turnover = await InventoryService.calculateMonthlyTurnover(productId);
            return reply.send(turnover);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao calcular giro mensal' });
        }
    }

    // Buscar produtos com estoque crítico
    static async getCriticalStock(request: FastifyRequest, reply: FastifyReply) {
        try {
            const criticalProducts = await InventoryService.getCriticalStock();
            return reply.send(criticalProducts);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao buscar estoque crítico' });
        }
    }

    // Buscar produtos (similar ao POS mas com mais detalhes)
    static async getProducts(request: FastifyRequest<{ Querystring: { 
        search?: string; 
        categoryId?: string; 
        includeInactive?: string; 
    } }>, reply: FastifyReply) {
        try {
            const { search, categoryId, includeInactive } = request.query;

            const where: any = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (categoryId) {
                where.categoryId = categoryId;
            }
            if (includeInactive !== 'true') {
                where.isActive = true;
            }

            const products = await prisma.product.findMany({
                where,
                include: { category: true },
                orderBy: { name: 'asc' }
            });

            return reply.send(products);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao buscar produtos' });
        }
    }

    // Atualizar produto (PUT /products/:id)
    static async updateProduct(request: FastifyRequest<{ Params: { id: string }, Body: any }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const data = productSchema.parse({ ...body, id });

            const product = await InventoryService.createOrUpdateProduct(data);

            return reply.send({
                message: 'Produto atualizado com sucesso',
                product
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(400).send({
                message: 'Erro ao atualizar produto',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Deletar produto
    static async deleteProduct(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            const product = await prisma.product.findUnique({
                where: { id }
            });

            if (!product) {
                return reply.status(404).send({ message: 'Produto não encontrado' });
            }

            const stockMovements = await prisma.stockMovement.findMany({
                where: { productId: id }
            });

            if (stockMovements.length > 0) {
                await prisma.product.update({
                    where: { id },
                    data: { isActive: false }
                });

                return reply.send({
                    message: 'Produto desativado com sucesso (possui movimentações de estoque associadas)'
                });
            }

            await prisma.product.delete({
                where: { id }
            });

            return reply.send({ message: 'Produto deletado com sucesso' });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                message: 'Erro ao deletar produto',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Buscar categorias de produtos
    static async getCategories(request: FastifyRequest, reply: FastifyReply) {
        try {
            const categories = await prisma.category.findMany({
                where: { type: 'PRODUCT' },
                orderBy: { name: 'asc' }
            });
            return reply.send(categories);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Erro ao buscar categorias' });
        }
    }

    // Upload de imagem
    static async uploadImage(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = await request.file();
            
            if (!data) {
                return reply.status(400).send({ message: 'Nenhum arquivo enviado' });
            }

            const buffer = await data.toBuffer();
            
            const result = await StorageService.uploadFile({
                buffer,
                mimetype: data.mimetype,
                originalname: data.filename || 'image.jpg'
            }, 'products');

            return reply.send({ url: result.url, key: result.key });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ 
                message: 'Erro ao fazer upload da imagem',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}