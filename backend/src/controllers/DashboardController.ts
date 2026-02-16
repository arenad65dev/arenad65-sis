import { FastifyReply, FastifyRequest } from 'fastify';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
    static async getKPIs(request: FastifyRequest, reply: FastifyReply) {
        try {
            const kpis = await DashboardService.getKPIs();
            return reply.send(kpis);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching KPIs' });
        }
    }

    static async getRecentTransactions(request: FastifyRequest, reply: FastifyReply) {
        try {
            const transactions = await DashboardService.getRecentTransactions();
            return reply.send(transactions);
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching transactions' });
        }
    }

    static async getAnalytics(request: FastifyRequest, reply: FastifyReply) {
        try {
            const [chartData, topProducts, margin, maintenance] = await Promise.all([
                DashboardService.getChartData(),
                DashboardService.getTopProducts(),
                DashboardService.getMarginBreakdown(),
                DashboardService.getMaintenanceTasks()
            ]);

            return reply.send({
                chartData,
                topProducts,
                margin,
                maintenance
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ message: 'Error fetching analytics' });
        }
    }
}
