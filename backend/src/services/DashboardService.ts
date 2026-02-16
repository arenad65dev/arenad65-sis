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
        const topSelling = await prisma.orderItem.groupBy({
            by: ['productId'],
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
        // Bar = Product Type PRODUCT
        // Facilities = Product Type SERVICE or RENTAL

        // We need to sum OrderItems based on product type
        const orderItems = await prisma.orderItem.findMany({
            include: { product: true }
        });

        let barTotal = 0;
        let facilitiesTotal = 0;

        orderItems.forEach(item => {
            const total = Number(item.price) * item.quantity;
            if (item.product.type === 'PRODUCT') {
                barTotal += total;
            } else {
                facilitiesTotal += total;
            }
        });

        const grandTotal = barTotal + facilitiesTotal || 1; // Prevent div by zero

        return {
            bar: { value: barTotal, percentage: Math.round((barTotal / grandTotal) * 100) },
            facilities: { value: facilitiesTotal, percentage: Math.round((facilitiesTotal / grandTotal) * 100) }
        };
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
