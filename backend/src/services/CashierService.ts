import { prisma } from '../lib/prisma';
import { CashierStatus } from '../generated/client/client';

export class CashierService {
    // Open cashier session
    static async openCashier(data: {
        userId: string;
        initialBalance: number;
    }) {
        // Check if there's ANY open session (only one cashier allowed)
        const existingOpenSession = await prisma.cashierSession.findFirst({
            where: {
                status: CashierStatus.OPEN
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (existingOpenSession) {
            throw new Error(`Já existe um caixa aberto por ${existingOpenSession.user.name} desde ${new Date(existingOpenSession.openedAt).toLocaleString('pt-BR')}. Feche-o antes de abrir um novo.`);
        }

        // Create new cashier session
        const session = await prisma.cashierSession.create({
            data: {
                userId: data.userId,
                openedAt: new Date(),
                initialBalance: data.initialBalance,
                status: CashierStatus.OPEN,
                totalSales: 0,
                totalSkimmings: 0
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return session;
    }

    // Close cashier session
    static async closeCashier(sessionId: string, finalBalance?: number) {
        const session = await prisma.cashierSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            throw new Error('Sessão de caixa não encontrada');
        }

        if (session.status !== CashierStatus.OPEN) {
            throw new Error('Esta sessão de caixa já está fechada');
        }

        const updatedSession = await prisma.cashierSession.update({
            where: { id: sessionId },
            data: {
                status: CashierStatus.CLOSED,
                closedAt: new Date(),
                finalBalance: finalBalance
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                skimmings: true
            }
        });

        return updatedSession;
    }

    // Record skimming (cash withdrawal)
    static async recordSkimming(data: {
        sessionId: string;
        userId: string;
        amount: number;
        reason: string;
    }) {
        // Check if session is open
        const session = await prisma.cashierSession.findUnique({
            where: { id: data.sessionId }
        });

        if (!session) {
            throw new Error('Sessão de caixa não encontrada');
        }

        if (session.status !== CashierStatus.OPEN) {
            throw new Error('Não é possível registrar sangria em uma sessão fechada');
        }

        // Create skimming record with userId
        const skimming = await prisma.skimming.create({
            data: {
                sessionId: data.sessionId,
                userId: data.userId,
                amount: data.amount,
                reason: data.reason,
                createdAt: new Date()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Update session total skimmings
        const updatedSession = await prisma.cashierSession.update({
            where: { id: data.sessionId },
            data: {
                totalSkimmings: {
                    increment: data.amount
                }
            }
        });

        return { skimming, session: updatedSession };
    }

    // Get current open session for user (now returns ANY open session - shared cashier)
    static async getCurrentSession(userId: string) {
        // First check if there's an open session (shared by all users)
        const openSession = await prisma.cashierSession.findFirst({
            where: {
                status: CashierStatus.OPEN
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                skimmings: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        // If there's an open session, return it regardless of who opened it
        // This allows all users to use the same cashier
        if (openSession) {
            return openSession;
        }

        // No open session - return null
        return null;
    }

    // Get all sessions for a user
    static async getUserSessions(userId: string, options?: {
        limit?: number;
        offset?: number;
    }) {
        const sessions = await prisma.cashierSession.findMany({
            where: {
                userId: userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                skimmings: true
            },
            orderBy: {
                openedAt: 'desc'
            },
            take: options?.limit || 50,
            skip: options?.offset || 0
        });

        return sessions;
    }

    // Update session sales total (called when orders are paid)
    static async updateSalesTotal(sessionId: string, amount: number) {
        const session = await prisma.cashierSession.update({
            where: { id: sessionId },
            data: {
                totalSales: {
                    increment: amount
                }
            }
        });

        return session;
    }

    // Get session summary
    static async getSessionSummary(sessionId: string) {
        const session = await prisma.cashierSession.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                skimmings: true,
                transactions: {
                    include: {
                        category: true
                    }
                }
            }
        });

        if (!session) {
            throw new Error('Sessão de caixa não encontrada');
        }

        return session;
    }

    // Get ANY open session (global status)
    static async getOpenSession() {
        const session = await prisma.cashierSession.findFirst({
            where: {
                status: CashierStatus.OPEN
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                skimmings: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        return session;
    }
}