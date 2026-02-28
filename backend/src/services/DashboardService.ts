import { prisma } from '../lib/prisma';
import { TransactionType } from '../generated/client/client';
import { InventoryService } from './InventoryService';

export class DashboardService {
    static async getKPIs() {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate income for current month
        const incomeAgg = await prisma.transaction.aggregate({
            where: {
                type: 'INCOME',
                date: { gte: firstDayOfMonth }
            },
            _sum: { amount: true }
        });

        // Calculate expenses for current month
        const expenseAgg = await prisma.transaction.aggregate({
            where: {
                type: 'EXPENSE',
                date: { gte: firstDayOfMonth }
            },
            _sum: { amount: true }
        });

        const income = incomeAgg._sum.amount ? Number(incomeAgg._sum.amount) : 0;
        const expense = expenseAgg._sum.amount ? Number(expenseAgg._sum.amount) : 0;

        // Calculate inventory KPIs
        const inventoryKPIs = await this.getInventoryKPIs();

        return {
            monthlyIncome: income,
            monthlyExpense: expense,
            netProfit: income - expense,
            ...inventoryKPIs
        };
    }

    static async getRecentTransactions(limit = 10) {
        return prisma.transaction.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: {
                category: true, // category relationship is correct
                cashierSession: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        });
    }

    static async getChartData() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const transactions = await prisma.transaction.findMany({
            where: {
                type: 'INCOME',
                date: { gte: sevenDaysAgo }
            },
            select: { date: true, amount: true }
        });

        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = days[d.getDay()];
            const dayIncome = transactions
                .filter(t => t.date.getDate() === d.getDate() && t.date.getMonth() === d.getMonth())
                .reduce((acc, t) => acc + Number(t.amount), 0);
            chartData.push({ name: dayName, income: dayIncome });
        }
        return chartData;
    }

    static async getTopProducts() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const topSelling = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    createdAt: {
                        gte: thirtyDaysAgo
                    }
                }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const enriched = await Promise.all(topSelling.map(async (item) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            return {
                name: product?.name || 'Item Removido',
                sales: item._sum.quantity || 0,
                growth: '+0%' // Placeholder
            };
        }));
        return enriched;
    }

    static async getMarginBreakdown() {
        const orderItems = await prisma.orderItem.findMany({
            include: { product: { include: { category: true } } }
        });

        const categoryTotals: Record<string, number> = {};
        let grandTotal = 0;

        orderItems.forEach(item => {
            const total = Number(item.price) * item.quantity;
            const categoryName = item.product.category?.name || (item.product.type === 'SERVICE' ? 'Quadras/Serviços' : 'Outros');
            categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + total;
            grandTotal += total;
        });

        if (grandTotal === 0) grandTotal = 1;

        const result = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value / grandTotal) * 100)
        })).sort((a, b) => b.value - a.value);

        return result;
    }

    static async getMaintenanceTasks() {
        return prisma.maintenance.findMany({
            where: { status: 'PENDING' },
            orderBy: { date: 'asc' },
            take: 3
        });
    }

    static async getInventoryKPIs() {
        // Get total products count
        const totalProducts = await prisma.product.count({
            where: { type: 'PRODUCT', isActive: true }
        });

        // Get total stock value
        const products = await prisma.product.findMany({
            where: { type: 'PRODUCT', isActive: true },
            select: { price: true, stock: true }
        });

        const totalStockValue = products.reduce((acc, p) => {
            return acc + (Number(p.price) * (p.stock || 0));
        }, 0);

        // Get critical stock items
        const criticalItems = await InventoryService.getCriticalStock();

        // Calculate average turnover
        const turnoverData = await InventoryService.calculateMonthlyTurnover();
        const avgTurnover = turnoverData.length > 0
            ? turnoverData.reduce((acc, item) => acc + item.turnover, 0) / turnoverData.length
            : 0;

        return {
            totalProducts,
            totalStockValue,
            criticalItems: criticalItems.length,
            avgTurnover: Number((Number(avgTurnover) || 0).toFixed(2))
        };
    }
}
