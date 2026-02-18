-- Script para limpar dados de vendas e transações, mantendo apenas produtos
-- e zerando o estoque

-- Desativar verificações de chave estrangeira temporariamente
SET session_replication_role = 'replica';

-- Limpar tabelas de transações e vendas
DELETE FROM "Transaction";
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "ActivityLog";
DELETE FROM "CashierSession";
DELETE FROM "StockMovement";

-- Zerar estoque de todos os produtos
UPDATE "Product" SET stock = 0;

-- Reativar verificações de chave estrangeira
SET session_replication_role = 'origin';

-- Verificar contagem
SELECT 'Products' as table_name, COUNT(*) as count FROM "Product"
UNION ALL
SELECT 'Orders', COUNT(*) FROM "Order"
UNION ALL
SELECT 'Transactions', COUNT(*) FROM "Transaction"
UNION ALL
SELECT 'ActivityLogs', COUNT(*) FROM "ActivityLog";
