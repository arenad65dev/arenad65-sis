import { prisma } from '../lib/prisma';
import { PaymentMethod, TransactionType } from '../generated/client/client';

export interface FinanceFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  limit?: number;
}

export class FinanceService {
  static async getSummary(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [incomeAgg, expenseAgg, transactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where,
        select: { paymentMethod: true, amount: true },
      }),
    ]);

    const revenue = Number(incomeAgg._sum.amount || 0);
    const expenses = Number(expenseAgg._sum.amount || 0);

    const paymentMethods = transactions.reduce((acc, tx) => {
      const method = (tx.paymentMethod || 'UNKNOWN') as PaymentMethod | 'UNKNOWN';
      acc[method] = (acc[method] || 0) + Number(tx.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      revenue,
      expenses,
      net: revenue - expenses,
      transactionCount: transactions.length,
      paymentMethods,
    };
  }

  static async getTransactions(filters: FinanceFilters = {}) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: filters.limit || 100,
      include: {
        category: { select: { name: true } },
        cashierSession: {
          include: {
            user: { select: { name: true } },
          },
        },
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: { select: { name: true } }
                  }
                }
              }
            }
          }
        },
      },
    });

    return transactions.map((tx) => {
      let orderCategories: Record<string, number> = {};
      let totalOrderAmount = 0;
      if (tx.order?.items) {
        tx.order.items.forEach((item) => {
          const cname = item.product?.category?.name || (item.product?.type === 'SERVICE' ? 'Quadras / Serviços' : 'Outros');
          const value = Number(item.price) * item.quantity;
          orderCategories[cname] = (orderCategories[cname] || 0) + value;
          totalOrderAmount += value;
        });
      }

      // If the transaction amount doesn't match the order items total exactly (meaning partial payment), we can scale it down if needed, but for category shares, we'll track raw values.
      // To keep sums correct on the finance page, we should scale the category amounts proportionally if partial payment occurred.
      const txAmount = Number(tx.amount);
      if (totalOrderAmount > 0 && totalOrderAmount !== txAmount) {
        const factor = txAmount / totalOrderAmount;
        for (const key in orderCategories) {
          orderCategories[key] = orderCategories[key] * factor;
        }
      }

      return {
        id: tx.id,
        type: tx.type,
        amount: txAmount,
        description: tx.description || (tx.type === 'INCOME' ? 'Receita' : 'Despesa'),
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        category: tx.category?.name || (tx.orderId ? 'Bar / PDV' : null),
        cashier: tx.cashierSession?.user?.name || null,
        orderNumber: tx.order?.number || null,
        orderCategories: Object.keys(orderCategories).length > 0 ? orderCategories : null,
      };
    });
  }
}
