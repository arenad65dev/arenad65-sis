import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../lib/prisma';

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@arena.com' }
    });
    console.log('User found:', user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
