import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../lib/prisma';
import { CashierService } from '../services/CashierService';
import { TableService } from '../services/TableService';
import { POSService } from '../services/POSService';
import { ClientService } from '../services/ClientService';
import { PaymentMethod, ProductType } from '../generated/client/client';

async function main() {
    console.log('🚀 Starting POS Day Simulation (E2E Test)...\n');

    try {
        // 0. Setup: Get a User (Admin/Cashier) and a Product
        const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!user) throw new Error('No admin user found. Run seed first.');

        const beer = await prisma.product.findFirst({ where: { name: { contains: 'Cerveja' } } });
        const snack = await prisma.product.findFirst({ where: { name: { contains: 'Amendoim' } } });

        if (!beer || !snack) throw new Error('Products not found. Run seed first.');

        console.log(`👤 User: ${user.name}`);
        console.log(`🍺 Product 1: ${beer.name} (R$ ${beer.price})`);
        console.log(`🥜 Product 2: ${snack.name} (R$ ${snack.price})\n`);

        // 1. Open Cashier
        console.log('1️⃣  Opening Cashier...');

        // Find and close existing session if any
        const existingSession = await CashierService.getCurrentSession(user.id);
        if (existingSession) {
            console.log('   (Closing existing session first...)');
            await CashierService.closeCashier(existingSession.id, 0); // Close with 0 diff
        }

        const session = await CashierService.openCashier({
            userId: user.id,
            initialBalance: 100.00
        });
        console.log(`✅ Cashier Open with R$ 100.00 (ID: ${session.id})`);

        // 2. Register Client (CRM)
        console.log('\n2️⃣  Registering Client...');
        const clientName = `Simulated Client ${Date.now()}`;
        const client = await ClientService.create({
            name: clientName,
            phone: '11999999999'
        });
        console.log(`✅ Client Registered: ${client.name} (ID: ${client.id})`);

        // 3. Open Table
        console.log('\n3️⃣  Opening Table 10...');
        let tableOrder = await TableService.openTable({
            tableNumber: '10',
            userId: user.id
        });
        console.log(`✅ Table 10 Open (Order #${tableOrder.number})`);

        // 4. Add Items to Table
        console.log('\n4️⃣  Adding Items to Table 10...');
        // 2 Beers
        await TableService.addItemsToTable('10', [
            { productId: beer.id, quantity: 2 }
        ]);
        // 1 Snack
        tableOrder = await TableService.addItemsToTable('10', [
            { productId: snack.id, quantity: 1 }
        ]);
        console.log(`✅ Items Added. Table Total: R$ ${tableOrder.totalAmount}`);

        // 5. Transfer Table (Optional Scenario)
        console.log('\n5️⃣  Transferring Table 10 -> 15...');
        await TableService.transferTable('10', '15');
        console.log(`✅ Transferred to Table 15.`);

        // 6. Close Table
        console.log('\n6️⃣  Closing Table 15...');
        const tableToClose = await TableService.getTable('15');
        if (!tableToClose) throw new Error('Table 15 not found');
        const closedTable = await TableService.closeTable('15', {
            paymentMethod: 'CREDIT_CARD',
            paidAmount: Number(tableToClose.totalAmount),
            clientId: client.id // Link client!
        }, user.id);
        console.log(`✅ Table 15 Closed. Paid: R$ ${closedTable.totalAmount} by ${clientName}`);

        // 7. Direct Sale (Counter)
        console.log('\n7️⃣  Making Direct Sale (Balcão)...');
        const directOrder = await POSService.createOrder({
            items: [{ productId: beer.id, quantity: 1 }],
            userId: user.id,
            clientId: client.id
        });
        await POSService.payOrder(directOrder.id, PaymentMethod.CASH, user.id);
        console.log(`✅ Direct Sale #${directOrder.number} Paid (Cash).`);

        // 8. Skimming (Sangria)
        console.log('\n8️⃣  Performing Skimming (Sangria)...');
        await CashierService.recordSkimming({
            sessionId: session.id,
            amount: 50.00,
            reason: 'Compra de Gelo'
        });
        console.log(`✅ Skimming of R$ 50.00 recorded.`);

        // 9. Close Cashier
        console.log('\n9️⃣  Closing Cashier...');
        const summary = await CashierService.getSessionSummary(session.id);
        console.log('   --- Session Summary ---');
        console.log(`   Initial: R$ ${summary.initialBalance}`);
        console.log(`   Sales:   R$ ${summary.totalSales}`);
        console.log(`   Sangria: R$ ${summary.totalSkimmings}`);
        const expected = Number(summary.initialBalance) + Number(summary.totalSales) - Number(summary.totalSkimmings)
        console.log(`   Expected: R$ ${expected}`);

        const closedSession = await CashierService.closeCashier(session.id, expected);
        console.log(`✅ Cashier Closed. Status: ${closedSession.status}`);

        console.log('\n🎉 SIMULATION COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ SIMULATION FAILED:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
