import { prisma } from '../lib/prisma';
import { Role, ProductType } from '../generated/client/client';
import { PasswordUtils } from '../utils/password';

async function main() {
    console.log('🌱 Starting MVP seeding...');

    // 1. Clean up (optional - be careful in prod)
    // await prisma.orderItem.deleteMany();
    // await prisma.order.deleteMany();
    // await prisma.transaction.deleteMany();
    // await prisma.product.deleteMany();
    // await prisma.category.deleteMany();
    // await prisma.user.deleteMany();

    // 2. Create Essential Users
    const adminPassword = await PasswordUtils.hashPassword('admin');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@arena.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@arena.com',
            password: adminPassword,
            role: Role.ADMIN,
            avatar: 'https://i.pravatar.cc/150?u=admin'
        }
    });

    const cashierPassword = await PasswordUtils.hashPassword('123');
    const cashier = await prisma.user.upsert({
        where: { email: 'cashier@arena.com' },
        update: {},
        create: {
            name: 'Carlos Silva',
            email: 'cashier@arena.com',
            password: cashierPassword,
            role: Role.CASHIER,
            avatar: 'https://i.pravatar.cc/150?u=carlos'
        }
    });

    console.log('✅ Essential users created or found');

    // 3. Ensure Categories Exist
    const categoriesToCreate = [
        { name: 'Bebidas', color: '#3b82f6' },
        { name: 'Lanches', color: '#f59e0b' },
        { name: 'Jantinhas', color: '#ec4899' },
        { name: 'Pastéis', color: '#eab308' },
        { name: 'Porções', color: '#84cc16' },
        { name: 'Panquecas', color: '#14b8a6' },
        { name: 'Parmegianas', color: '#f97316' },
        { name: 'Salgadinhos', color: '#6366f1' }
    ];

    const categoryIds: Record<string, string> = {};

    for (const catData of categoriesToCreate) {
        let cat = await prisma.category.findFirst({
            where: { name: catData.name }
        });

        if (!cat) {
            console.log(`Creating category: ${catData.name}`);
            cat = await prisma.category.create({
                data: {
                    name: catData.name,
                    type: 'PRODUCT',
                    color: catData.color
                }
            });
        }
        categoryIds[catData.name] = cat.id;
    }

    console.log('✅ Categories synced');

    // 4. Create Products
    // Lanches
    const products = [
        // Lanches
        { name: 'Lanche 160g - Cheddar', price: 45.0, cat: 'Lanches', desc: 'Hambúrguer 160g, salada, molho especial, batata e cheddar' },
        { name: 'Lanche 160g - Mussarela', price: 45.0, cat: 'Lanches', desc: 'Hambúrguer 160g, salada, molho especial, batata e mussarela' },

        // Jantinhas - Simples
        { name: 'Jantinha Simples - Carne', price: 15.0, cat: 'Jantinhas', desc: 'Espetinho de Carne + Mandioca' },
        { name: 'Jantinha Simples - Medalhão Carne', price: 15.0, cat: 'Jantinhas', desc: 'Espetinho de Medalhão de Carne + Mandioca' },
        { name: 'Jantinha Simples - Medalhão Frango', price: 15.0, cat: 'Jantinhas', desc: 'Espetinho de Medalhão de Frango + Mandioca' },
        { name: 'Jantinha Simples - Kafta', price: 15.0, cat: 'Jantinhas', desc: 'Espetinho de Kafta + Mandioca' },
        { name: 'Jantinha Simples - Coração', price: 15.0, cat: 'Jantinhas', desc: 'Espetinho de Coração + Mandioca' },

        // Jantinhas - Completa
        { name: 'Jantinha Completa - Carne', price: 30.0, cat: 'Jantinhas', desc: 'Carne, Arroz, Mandioca, Vinagrete, Farofa' },
        { name: 'Jantinha Completa - Medalhão Carne', price: 30.0, cat: 'Jantinhas', desc: 'Medalhão Carne, Arroz, Mandioca, Vinagrete, Farofa' },
        { name: 'Jantinha Completa - Medalhão Frango', price: 30.0, cat: 'Jantinhas', desc: 'Medalhão Frango, Arroz, Mandioca, Vinagrete, Farofa' },
        { name: 'Jantinha Completa - Kafta', price: 30.0, cat: 'Jantinhas', desc: 'Kafta, Arroz, Mandioca, Vinagrete, Farofa' },
        { name: 'Jantinha Completa - Coração', price: 30.0, cat: 'Jantinhas', desc: 'Coração, Arroz, Mandioca, Vinagrete, Farofa' },

        // Pastéis
        { name: 'Pastel - Carne e Queijo', price: 12.0, cat: 'Pastéis' },
        { name: 'Pastel - Frango e Queijo', price: 12.0, cat: 'Pastéis' },
        { name: 'Pastel - Presunto e Mussarela', price: 12.0, cat: 'Pastéis' },
        { name: 'Pastel - Misto (Carne/Q/F)', price: 12.0, cat: 'Pastéis', desc: 'Carne, Queijo e Frango' },

        // Porções
        { name: 'Dadinho de Tapioca', price: 35.0, cat: 'Porções' },
        { name: 'Porção de Frango', price: 35.0, cat: 'Porções' },
        { name: 'Porção de Batata', price: 35.0, cat: 'Porções' },
        { name: 'Porção Mista (Batata/Frango)', price: 35.0, cat: 'Porções' },

        // Panquecas
        { name: 'Panqueca - Carne', price: 30.0, cat: 'Panquecas', desc: 'Acompanha arroz e batata' },
        { name: 'Panqueca - Frango', price: 30.0, cat: 'Panquecas', desc: 'Acompanha arroz e batata' },

        // Parmegianas
        { name: 'Parmegiana de Frango', price: 35.0, cat: 'Parmegianas', desc: 'Acompanha arroz e batata' },
        { name: 'Parmegiana de Carne', price: 40.0, cat: 'Parmegianas', desc: 'Acompanha arroz e batata' },

        // Bebidas
        { name: 'Heineken Lata', price: 8.0, cat: 'Bebidas' },
        { name: 'Heineken Shot', price: 8.0, cat: 'Bebidas' },
        { name: 'Heineken Long Neck', price: 10.0, cat: 'Bebidas' },
        { name: 'Heineken Zero', price: 10.0, cat: 'Bebidas' },
        { name: 'Corona', price: 10.0, cat: 'Bebidas' },
        { name: 'Coronita', price: 8.0, cat: 'Bebidas' },
        { name: 'Brahma Lata', price: 6.0, cat: 'Bebidas' },
        { name: 'Original Lata', price: 6.0, cat: 'Bebidas' },
        { name: 'Skol Lata', price: 6.0, cat: 'Bebidas' },
        { name: 'Stella Artois', price: 10.0, cat: 'Bebidas' },
        { name: 'Energético', price: 15.0, cat: 'Bebidas' },
        { name: 'H2O', price: 8.0, cat: 'Bebidas' },
        { name: 'Gatorade', price: 10.0, cat: 'Bebidas' },
        { name: 'Água (com/sem gás)', price: 5.0, cat: 'Bebidas' },

        // Salgadinhos
        { name: 'Cheetos', price: 8.0, cat: 'Salgadinhos' },
        { name: 'Amendoim', price: 8.0, cat: 'Salgadinhos' },
        { name: 'Fandangos', price: 10.0, cat: 'Salgadinhos' },
        { name: 'Doritos', price: 10.0, cat: 'Salgadinhos' },
        { name: 'Ruffles', price: 10.0, cat: 'Salgadinhos' },
        { name: 'Batata Tubo', price: 20.0, cat: 'Salgadinhos' }
    ];

    // 4. Upsert Products (Synchronize)
    for (const p of products) {
        // Find existing product by name (since name isn't unique in schema but is our functional key)
        const existingProduct = await prisma.product.findFirst({
            where: { name: p.name }
        });

        if (existingProduct) {
            console.log(`⏩ Product already exists: ${p.name}`);
            // Optional: Update price if needed
            // await prisma.product.update({ where: { id: existingProduct.id }, data: { price: p.price } });
        } else {
            console.log(`✨ Creating product: ${p.name}`);
            await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.desc || p.name,
                    price: p.price,
                    costPrice: Number((p.price * 0.4).toFixed(2)), // Mock cost 40%
                    stock: 50, // Mock initial stock
                    categoryId: categoryIds[p.cat],
                    type: ProductType.PRODUCT,
                    imageUrl: `https://placehold.co/400x400?text=${encodeURIComponent(p.name)}`
                }
            });
        }
    }

    console.log('✅ Products synced');
    console.log('🚀 Seed finished successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
