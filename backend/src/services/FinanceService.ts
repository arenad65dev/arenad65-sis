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
        order: { select: { number: true } },
      },
    });

    return transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      description: tx.description || (tx.type === 'INCOME' ? 'Receita' : 'Despesa'),
      date: tx.date,
      paymentMethod: tx.paymentMethod,
      category: tx.category?.name || (tx.orderId ? 'Bar / PDV' : null),
      cashier: tx.cashierSession?.user?.name || null,
      orderNumber: tx.order?.number || null,
    }));
  }
}
