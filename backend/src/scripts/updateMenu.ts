import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

import { prisma } from '../lib/prisma';
import { ProductType } from '../generated/client/client';

// Interface para o cardápio
interface MenuItem {
  sku: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  options?: Array<{
    group: string;
    required: boolean;
    values: string[];
  }>;
}

interface Category {
  code: string;
  name: string;
  items: MenuItem[];
}

interface MenuData {
  catalog_name: string;
  currency: string;
  categories: Category[];
}

// Mapeamento de categorias para cores
const categoryColors: Record<string, string> = {
  'Lanches': '#f59e0b',
  'Jantinhas': '#ef4444',
  'Pastéis': '#f97316',
  'Porções': '#a855f7',
  'Panquecas': '#ec4899',
  'Parmegianas': '#8b5cf6',
  'Bebidas': '#3b82f6',
  'Salgadinhos': '#10b981'
};

// Função para gerar URL de imagem baseada no nome do produto
const generateImageUrl = (name: string, category: string): string => {
  const baseUrl = 'https://placehold.co/400x400';
  const bgColor = categoryColors[category] || '#6b7280';
  const textColor = 'white';
  const text = encodeURIComponent(name.substring(0, 15));
  return `${baseUrl}/${bgColor}/${textColor}?text=${text}`;
};

async function updateMenu() {
  console.log('🔄 Starting menu update...');
  
  try {
    // Ler o arquivo do cardápio
    const menuPath = path.join(__dirname, '../../../docs/cardapio.md');
    const menuContent = fs.readFileSync(menuPath, 'utf-8');
    
    // Remover o formato markdown e converter para JSON
    const jsonContent = menuContent.replace(/```json\n?|\n?```/g, '');
    const menuData: MenuData = JSON.parse(jsonContent);
    
    console.log(`📋 Loaded menu: ${menuData.catalog_name}`);
    
    // Para cada categoria no cardápio
    for (const categoryData of menuData.categories) {
      console.log(`📂 Processing category: ${categoryData.name}`);
      
      // Criar ou encontrar a categoria
      let category = await prisma.category.findFirst({
        where: { name: categoryData.name }
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryData.name,
            type: 'PRODUCT',
            color: categoryColors[categoryData.name] || '#6b7280'
          }
        });
        console.log(`✅ Created category: ${categoryData.name}`);
      }
      
      // Para cada item na categoria
      for (const item of categoryData.items) {
        // Verificar se o produto já existe pelo SKU
        const existingProduct = await prisma.product.findFirst({
          where: { 
            name: item.name,
            categoryId: category.id
          }
        });
        
        const productData = {
          name: item.name,
          description: item.description || `${item.name} - ${categoryData.name}`,
          price: item.price,
          costPrice: item.price * 0.6, // Estimativa de 60% do preço de venda
          stock: 50, // Estoque inicial padrão
          minStock: 10, // Estoque mínimo padrão
          categoryId: category.id,
          type: ProductType.PRODUCT,
          imageUrl: generateImageUrl(item.name, categoryData.name),
          isActive: true // Garantir que o produto esteja ativo
        };
        
        if (existingProduct) {
          // Atualizar produto existente
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData
          });
          console.log(`🔄 Updated product: ${item.name}`);
        } else {
          // Criar novo produto
          await prisma.product.create({
            data: {
              ...productData,
              // Adicionar campo SKU se existir no modelo
              ...(item.sku && { sku: item.sku })
            }
          });
          console.log(`➕ Created product: ${item.name}`);
        }
      }
    }
    
    console.log('✅ Menu update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating menu:', error);
    throw error;
  }
}

// Executar a atualização
updateMenu()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });