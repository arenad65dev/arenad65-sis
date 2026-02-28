import 'dotenv/config';
import { PrismaClient } from './src/generated/client/index.js';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } });
  
  const noCategory = products.filter(p => !p.categoryId).length;
  const withCategory = products.filter(p => p.categoryId).length;
  
  console.log(`Products with category: ${withCategory}`);
  console.log(`Products without category: ${noCategory}`);
  
  const categories = {};
  for(const p of products) {
    if(p.category) {
      categories[p.category.name] = (categories[p.category.name] || 0) + 1;
    }
  }
  console.log('Categories breakdown:', categories);
}
main().finally(() => prisma.$disconnect());
