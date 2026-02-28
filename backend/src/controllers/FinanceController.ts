import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { FinanceService } from '../services/FinanceService';

const querySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  limit: z.coerce.number().int().positive().max(2000).optional(),
});

export class FinanceController {
  static async getSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate } = querySchema.parse(request.query || {});

      const summary = await FinanceService.getSummary(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return reply.send(summary);
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ message: 'Erro ao buscar resumo financeiro' });
    }
  }

  static async getTransactions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate, type, limit } = querySchema.parse(request.query || {});

      const transactions = await FinanceService.getTransactions({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type,
        limit,
      });

      return reply.send(transactions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Parâmetros de busca inválidos', issues: error.issues });
      }
      request.log.error(error);
      return reply.status(400).send({ message: 'Erro ao buscar transações financeiras' });
    }
  }
}
