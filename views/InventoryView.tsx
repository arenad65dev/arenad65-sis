
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_PRODUCTS } from '../constants';
// import { Product } from '../types'; // Using from inventoryService instead
import ProductModal from '../components/ProductModal';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import StockHistoryModal from '../components/StockHistoryModal';
import { inventoryService, Product } from '../services/inventoryService';

interface Toast {
  id: number;
  message: string;
}

const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [avgTurnover, setAvgTurnover] = useState<number>(0);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await inventoryService.getProducts();
        if (products && Array.isArray(products)) {
          setProducts(products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Keep using mock data if API fails
      }
    };

    fetchProducts();
    
    // Fetch monthly turnover
    const fetchTurnover = async () => {
      try {
        const turnoverData = await inventoryService.getMonthlyTurnover();
        const avg = turnoverData.length > 0
          ? turnoverData.reduce((acc, item) => acc + item.turnover, 0) / turnoverData.length
          : 0;
        setAvgTurnover(avg);
      } catch (error) {
        console.error('Error fetching turnover:', error);
      }
    };
    
    fetchTurnover();
  }, []);

  // Get unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category?.name || 'Sem Categoria')));
    return ['Todos', ...uniqueCategories];
  }, [products]);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = categoryFilter === 'Todos' || (p.category?.name === categoryFilter);
      return matchSearch && matchCategory;
    });
  }, [search, categoryFilter, products]);

  const stats = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
    const criticalItems = products.filter(p => (Number(p.stock) || 0) < (Number(p.minStock) || 0)).length;
    return { totalValue, criticalItems };
  }, [products]);

  const handleSaveProduct = async (data: Partial<Product>) => {
    try {
      const productData = {
        id: editingProduct?.id,
        name: data.name || '',
        description: data.description,
        price: data.price || 0,
        costPrice: data.costPrice,
        purchasePrice: data.purchasePrice,
        stock: data.stock || 0,
        minStock: data.minStock || 0,
        unit: data.unit || 'UN',
        sku: data.sku || '',
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
        categoryId: data.category?.id,
        type: 'PRODUCT' as 'PRODUCT' | 'SERVICE' | 'RENTAL',
        isActive: true
      };

      await inventoryService.createOrUpdateProduct(productData);
      
      // Refresh products list
      const products = await inventoryService.getProducts();
      setProducts(products);
      
      addToast(editingProduct ? `Produto "${data.name}" atualizado.` : `Novo produto "${data.name}" cadastrado.`);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      addToast('Erro ao salvar produto');
    }
  };

  const handlePurchaseOrder = async (orders: { productId: string, qty: number, cost: number }[]) => {
    try {
      const purchaseOrderData = {
        items: orders.map(order => ({
          productId: order.productId,
          quantity: order.qty,
          cost: order.cost
        })),
        reason: 'Entrada de mercadoria via sistema'
      };

      await inventoryService.recordPurchaseOrder(purchaseOrderData);
      
      // Refresh products list
      const products = await inventoryService.getProducts();
      setProducts(products);
      
      addToast('Estoque reabastecido e custos atualizados!');
    } catch (error) {
      console.error('Error recording purchase order:', error);
      addToast('Erro ao registrar entrada de mercadoria');
    }
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      try {
        await inventoryService.deleteProduct(product.id!);
        
        // Refresh products list
        const products = await inventoryService.getProducts();
        setProducts(products);
        
        addToast(`Produto "${product.name}" excluído com sucesso.`);
      } catch (error) {
        console.error('Error deleting product:', error);
        addToast('Erro ao excluir produto');
      }
    }
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setIsProductModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn pb-12">
      {/* Toasts */}
      <div className="fixed top-20 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="px-6 py-4 bg-slate-900 text-white dark:bg-primary dark:text-slate-900 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn border border-white/10 pointer-events-auto">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{t.message}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight dark:text-white">Estoque e Insumos</h1>
          <p className="text-slate-500 text-sm font-medium">Controle de bebidas, insumos técnicos e materiais de reposição.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPurchaseOrderOpen(true)}
            className="h-11 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
            Entrada Mercadoria
          </button>
          <button
            onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
            className="h-11 px-6 bg-primary hover:bg-primary-dark text-slate-900 font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Novo Item
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Itens', value: products.length.toString(), icon: 'inventory', desc: 'SKUs Cadastrados' },
          { label: 'Valor em Estoque', value: `R$ ${stats.totalValue.toLocaleString()}`, icon: 'payments', desc: 'Preço de Venda' },
          { label: 'Itens Críticos', value: stats.criticalItems.toString(), icon: 'warning', color: 'red', desc: 'Abaixo do Mínimo' },
          { label: 'Giro Mensal', value: `${(Number(avgTurnover) || 0).toFixed(1)}x`, icon: 'sync', color: 'blue', desc: 'Média Real' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-6 bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${kpi.color === 'red' ? 'text-red-500' : kpi.color === 'blue' ? 'text-blue-500' : 'text-slate-400'}`}>
                <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight dark:text-white leading-none mb-1">{kpi.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-6 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all dark:text-white"
            />
          </div>
          <div className="flex w-full lg:w-auto overflow-x-auto gap-2 pb-2 lg:pb-0 custom-scrollbar scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${categoryFilter === cat ? 'bg-slate-900 dark:bg-primary text-white dark:text-slate-900 border-transparent shadow-lg' : 'bg-white dark:bg-surface-dark text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/40'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">Produto / SKU</th>
                <th className="px-6 py-5">Categoria</th>
                <th className="px-6 py-5 text-center">Preço / Custo</th>
                <th className="px-6 py-5 text-center">Margem</th>
                <th className="px-6 py-5 text-center">Nível Mínimo</th>
                <th className="px-6 py-5 text-center">Estoque Atual</th>
                <th className="px-6 py-5">Integridade</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map(product => {
                const isCritical = (Number(product.stock) || 0) < (Number(product.minStock) || 0);
                return (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/50 dark:border-slate-800">
                          <img src={product.image || product.imageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black dark:text-white truncate uppercase tracking-tight">{product.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Ref: {product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-primary-blue rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                        {product.category?.name || 'Sem Categoria'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-black dark:text-white">R$ {(Number(product.price) || 0).toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400">Custo: R$ {(Number(product.purchasePrice) || 0).toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        ((Number(product.price) || 0) - (Number(product.purchasePrice) || 0)) / (Number(product.purchasePrice) || 1) * 100 > 30
                          ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/40'
                          : ((Number(product.price) || 0) - (Number(product.purchasePrice) || 0)) / (Number(product.purchasePrice) || 1) * 100 > 15
                          ? 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/40'
                          : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40'
                      }`}>
                        {(((Number(product.price) || 0) - (Number(product.purchasePrice) || 0)) / (Number(product.purchasePrice) || 1) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center text-[11px] font-black text-slate-400 uppercase">{Number(product.minStock) || 0} un</td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-lg font-black ${isCritical ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                          {Number(product.stock) || 0} <span className="text-[10px] text-slate-400">un</span>
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(((Number(product.stock) || 0) / (Number(product.minStock) || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${isCritical
                          ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40'
                          : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-primary dark:border-primary/20'
                        }`}>
                        <span className={`size-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                        {isCritical ? 'Baixo Estoque' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleEdit(product)}
                          className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary rounded-xl transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductForHistory(product);
                            setIsHistoryModalOpen(true);
                          }}
                          className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary-blue hover:border-primary-blue rounded-xl transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">history</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="size-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-500 rounded-xl transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center opacity-20">
              <span className="material-symbols-outlined text-6xl">inventory_2</span>
              <p className="text-xs font-black uppercase tracking-[0.2em] mt-4 text-center">Nenhum item encontrado no estoque</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />

      <PurchaseOrderModal
        isOpen={isPurchaseOrderOpen}
        onClose={() => setIsPurchaseOrderOpen(false)}
        products={products}
        onConfirm={handlePurchaseOrder}
      />

      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedProductForHistory(null);
        }}
        productId={selectedProductForHistory?.id}
        productName={selectedProductForHistory?.name}
      />
    </div>
  );
};

export default InventoryView;
