-- Script para remover produtos duplicados, mantendo apenas um de cada
-- Baseado no nome do produto

-- Primeiro, vamos ver quantos duplicados existem
SELECT name, COUNT(*) as count 
FROM "Product" 
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Criar tabela temporária com IDs a manter (o mais recente de cada nome)
CREATE TEMP TABLE products_to_keep AS
SELECT DISTINCT ON (name) id, name
FROM "Product"
ORDER BY name, "createdAt" DESC;

-- Verificar o que será mantido
SELECT * FROM products_to_keep ORDER BY name;

-- Deletar OrderItems que referenciam produtos duplicados (que serão deletados)
DELETE FROM "OrderItem" 
WHERE "productId" IN (
    SELECT id FROM "Product" 
    WHERE id NOT IN (SELECT id FROM products_to_keep)
);

-- Deletar StockMovements que referenciam produtos duplicados
DELETE FROM "StockMovement" 
WHERE "productId" IN (
    SELECT id FROM "Product" 
    WHERE id NOT IN (SELECT id FROM products_to_keep)
);

-- Finalmente, deletar os produtos duplicados
DELETE FROM "Product" 
WHERE id NOT IN (SELECT id FROM products_to_keep);

-- Limpar tabela temporária
DROP TABLE products_to_keep;

-- Verificar resultado
SELECT COUNT(*) as total_products FROM "Product";
SELECT name FROM "Product" ORDER BY name;
