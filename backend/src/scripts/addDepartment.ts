import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔄 Adicionando department aos usuários...');
    
    const result = await prisma.user.updateMany({
        where: { department: null },
        data: { department: 'Administrativo' }
    });
    
    console.log(`✅ ${result.count} usuários atualizados`);
    
    // Listar usuários
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, department: true }
    });
    
    console.log('\n📋 Usuários no banco:');
    users.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - ${u.role} - ${u.department}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
