import { FastifyReply, FastifyRequest } from 'fastify';
import { CashierService } from '../services/CashierService';
import { z } from 'zod';

const openCashierSchema = z.object({
    initialBalance: z.number().min(0)
});

const closeCashierSchema = z.object({
    finalBalance: z.number().min(0)
});

const recordSkimmingSchema = z.object({
    amount: z.number().min(0.01),
    reason: z.string().min(1)
});

export class CashierController {

    // Open cashier session
    static async openCashier(request: FastifyRequest, reply: FastifyReply) {
        try {
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            const data = openCashierSchema.parse(request.body);

            const session = await CashierService.openCashier({
                userId,
                initialBalance: data.initialBalance
            });

            return reply.status(201).send({
                message: 'Caixa aberto com sucesso',
                session
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(400).send({
                message: 'Erro ao abrir caixa',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Close cashier session
    static async closeCashier(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const data = closeCashierSchema.parse(request.body);

            const session = await CashierService.closeCashier(id, data.finalBalance);

            return reply.send({
                message: 'Caixa fechado com sucesso',
                session
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(400).send({
                message: 'Erro ao fechar caixa',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Record skimming
    static async recordSkimming(request: FastifyRequest, reply: FastifyReply) {
        try {
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            
            // First get current session for this user
            const currentSession = await CashierService.getCurrentSession(userId);
            if (!currentSession) {
                return reply.status(400).send({
                    message: 'Nenhuma sessão de caixa aberta encontrada'
                });
            }

            const data = recordSkimmingSchema.parse(request.body);
            const result = await CashierService.recordSkimming({
                sessionId: currentSession.id,
                amount: data.amount,
                reason: data.reason
            });

            return reply.send({
                message: 'Sangria registrada com sucesso',
                skimming: result.skimming,
                session: result.session
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(400).send({
                message: 'Erro ao registrar sangria',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get current session
    static async getCurrentSession(request: FastifyRequest, reply: FastifyReply) {
        try {
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            
            const session = await CashierService.getCurrentSession(userId);
            
            return reply.send(session);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                message: 'Erro ao buscar sessão atual'
            });
        }
    }

    // Get user sessions
    static async getUserSessions(request: FastifyRequest<{ Querystring: { 
        limit?: string; 
        offset?: string; 
    } }>, reply: FastifyReply) {
        try {
            // @ts-ignore - JWT user
            const userId = request.user?.id;
            const { limit, offset } = request.query;

            const sessions = await CashierService.getUserSessions(userId, {
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined
            });

            return reply.send(sessions);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                message: 'Erro ao buscar sessões'
            });
        }
    }

    // Get session summary
    static async getSessionSummary(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            
            const summary = await CashierService.getSessionSummary(id);
            
            return reply.send(summary);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                message: 'Erro ao buscar resumo da sessão',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get global open session (any user can see)
    static async getOpenSession(request: FastifyRequest, reply: FastifyReply) {
        try {
            const session = await CashierService.getOpenSession();
            
            return reply.send(session);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                message: 'Erro ao buscar status do caixa'
            });
        }
    }
}