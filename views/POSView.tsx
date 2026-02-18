
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { posService } from '../services/posService';
import { tableService, Table, TableItem } from '../services/tableService';
import { useCart } from '../hooks/useCart';
import CheckoutModal from '../components/CheckoutModal';
import ConfirmModal from '../components/ConfirmModal';
import SplitBillModal from '../components/SplitBillModal';
import NewClientModal from '../components/NewClientModal';
import { clientService } from '../services/clientService';
import { User } from '../types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Usando a interface Table do serviço

interface POSViewProps {
  isCashierOpen?: boolean;
  onOpenCashier?: () => void;
}

const POSView: React.FC<POSViewProps> = ({ isCashierOpen, onOpenCashier }) => {
  const [viewMode, setViewMode] = useState<'CATALOG' | 'TABLES'>('CATALOG');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [clientSearchResults, setClientSearchResults] = useState<User[]>([]);
  const [isSearchingClient, setIsSearchingClient] = useState(false);

  const [orderMode, setOrderMode] = useState<'DIRECT' | 'TABLE'>('DIRECT');
  const [tableNumber, setTableNumber] = useState('');
  const [openTables, setOpenTables] = useState<Record<string, Table>>({});

  const { items, addToCart, updateQty, removeFromCart, total, clearCart, setItems } = useCart();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [splitItems, setSplitItems] = useState<{ product: any, qty: number }[]>([]);
  const [directPaidAmount, setDirectPaidAmount] = useState(0);

  const prevTableRef = useRef<string>('');

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const [categories, setCategories] = useState(['Todos']);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Buscar categorias dinamicamente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await posService.getCategories();
        const uniqueCategories = ['Todos', ...new Set(data.map((c: any) => c.name))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await posService.getProducts(search, categoryFilter === 'Todos' ? undefined : categoryFilter);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
        addToast('Erro ao carregar produtos', 'error');
      } finally {
        setLoadingProducts(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [search, categoryFilter]);

  // Client Search Effect
  useEffect(() => {
    if (clientSearch.length < 3) {
      setClientSearchResults([]);
      return;
    }

    // Don't search if we just selected a user (which matches the search text)
    if (selectedUser && selectedUser.name === clientSearch) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingClient(true);
      try {
        const results = await clientService.list(clientSearch);
        setClientSearchResults(results);
      } catch (error) {
        console.error("Error searching clients", error);
      } finally {
        setIsSearchingClient(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [clientSearch, selectedUser]);

  const handleResetPDV = () => {
    clearCart();
    setSelectedUser(null);
    setClientSearch('');
    setTableNumber('');
    setSplitItems([]);
    setDirectPaidAmount(0);
    prevTableRef.current = '';
  };

  const handleSwitchOrderMode = (mode: 'DIRECT' | 'TABLE') => {
    if (orderMode === 'TABLE' && tableNumber !== '' && mode === 'DIRECT') {
      handleResetPDV();
    }
    setOrderMode(mode);
    addToast(`Modo: ${mode === 'DIRECT' ? 'Balcão' : 'Mesa'}`, 'info');
  };

  const loadTable = async (num: string) => {
    const isSwitchingTable = prevTableRef.current !== '' && prevTableRef.current !== num;

    if (num) {
      try {
        // Buscar mesa do backend
        const table = await tableService.getTable(num);

        if (table) {
          // Converter itens do backend para o formato do carrinho
          const cartItems = table.items.map(item => ({
            product: {
              ...item.product,
              price: Number(item.price)
            },
            qty: item.quantity
          }));

          setItems(cartItems);

          const tableClient = table.clientId || '';
          if (tableClient) {
            // TODO: Fetch real user if needed
            setClientSearch('');
          } else {
            setSelectedUser(null);
            setClientSearch('');
          }
          addToast(`Mesa ${num} carregada.`, 'info');
        } else {
          if (isSwitchingTable) {
            clearCart();
            setSelectedUser(null);
            setClientSearch('');
          } else {
            setSelectedUser(null);
            setClientSearch('');
          }
          addToast(`Mesa ${num} pronta para novos lançamentos.`, 'info');
        }
      } catch (error: any) {
        console.error('Error loading table:', error);

        // Handle specific error cases
        if (error.response?.status === 404) {
          // Automatically open the table if it doesn't exist
          try {
            addToast(`Abrindo mesa ${num} automaticamente...`, 'info');
            await tableService.openTable({ tableNumber: num });

            // Clear cart for new table
            clearCart();
            setSelectedUser(null);
            setClientSearch('');

            // Refresh open tables list
            const tables = await tableService.getOpenTables();
            const tablesMap: Record<string, Table> = {};
            tables.forEach((table: Table) => {
              tablesMap[table.tableNumber] = table;
            });
            setOpenTables(tablesMap);

            addToast(`Mesa ${num} aberta com sucesso!`, 'success');
          } catch (openError: any) {
            console.error('Error opening table:', openError);

            if (openError.response?.status === 400 && openError.response?.data?.message?.includes('já está aberta')) {
              addToast(`Mesa ${num} já está aberta!`, 'info');
              // Try to load the table again
              loadTable(num);
            } else {
              addToast('Erro ao abrir mesa automaticamente', 'error');
              // Clear cart for non-existent table
              clearCart();
              setSelectedUser(null);
              setClientSearch('');
            }
          }
        } else {
          addToast('Erro ao carregar mesa', 'error');
        }
      }
    } else {
      // Limpar se não houver número de mesa
      clearCart();
      setSelectedUser(null);
      setClientSearch('');
    }

    prevTableRef.current = num;
  };

  const handleLaunchToTable = async () => {
    if (!tableNumber) {
      addToast('Informe o número da mesa!', 'error');
      return;
    }

    if (items.length === 0) {
      addToast('Carrinho vazio! Adicione itens antes de lançar na mesa.', 'error');
      return;
    }

    try {
      // Converter itens do carrinho para o formato do backend
      const itemsForBackend = items.map(item => ({
        productId: item.product.id,
        quantity: item.qty
      }));

      // Enviar itens para o backend
      await tableService.addItemsToTable(tableNumber, itemsForBackend);

      addToast(`Itens lançados na Mesa ${tableNumber}!`);
      handleResetPDV();
    } catch (error: any) {
      console.error('Error launching to table:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('não está aberta')) {
          addToast(`Mesa ${tableNumber} não está aberta. Por favor, abra a mesa primeiro.`, 'error');
        } else if (error.response?.data?.message?.includes('Estoque insuficiente')) {
          addToast(`Estoque insuficiente para alguns itens.`, 'error');
        } else {
          addToast(error.response?.data?.message || 'Erro ao lançar itens na mesa', 'error');
        }
      } else {
        addToast('Erro ao lançar itens na mesa', 'error');
      }
    }
  };

  const handleFinishOrder = async (data: any) => {
    try {
      if (orderMode === 'TABLE' && tableNumber) {
        // Fechar mesa
        const paymentData = {
          paymentMethod: data.method === 'credit' ? 'CREDIT_CARD' :
            data.method === 'debit' ? 'DEBIT_CARD' :
              data.method === 'pix' ? 'PIX' : 'CASH',
          paidAmount: currentTableBalance
        };

        await tableService.closeTable(tableNumber, paymentData);
        addToast(`Mesa ${tableNumber} fechada com sucesso!`);
      } else {
        // Venda direta
        const orderData = {
          items: items.map(i => ({ productId: i.product.id, quantity: i.qty }))
          // userId: selectedUser?.id // If you have user selection logic
        };

        const createdOrder = await posService.createOrder(orderData);

        // Map frontend payment method to backend enum
        let method = 'CASH';
        if (data.method === 'credit') method = 'CREDIT_CARD';
        if (data.method === 'debit') method = 'DEBIT_CARD';
        if (data.method === 'pix') method = 'PIX';

        await posService.payOrder(createdOrder.id, method);
        addToast(`Venda #${createdOrder.number} finalizada com sucesso!`);
      }

      setIsCheckoutOpen(false);
      setSplitItems([]);
      handleResetPDV();

    } catch (error) {
      console.error(error);
      addToast('Erro ao processar venda', 'error');
    }
  };

  const handleSplitConfirm = (selectedToPay: { product: any, qty: number }[]) => {
    setSplitItems(selectedToPay);
    setIsSplitModalOpen(false);
    setIsCheckoutOpen(true);
  };

  // Carregar mesas abertas do backend
  useEffect(() => {
    const fetchOpenTables = async () => {
      try {
        const tables = await tableService.getOpenTables();
        const tablesMap: Record<string, Table> = {};

        tables.forEach((table: Table) => {
          tablesMap[table.tableNumber] = table;
        });

        setOpenTables(tablesMap);
      } catch (error) {
        console.error('Error fetching open tables:', error);
      }
    };

    fetchOpenTables();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchOpenTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentTableBalance = useMemo(() => {
    if (splitItems.length > 0) {
      return splitItems.reduce((acc, i) => acc + (i.product.price * i.qty), 0);
    }
    if (orderMode === 'TABLE' && tableNumber && openTables[tableNumber]) {
      return Number(openTables[tableNumber].totalAmount) - 0; // No backend, tables don't have paidAmount
    }
    return total - directPaidAmount;
  }, [tableNumber, openTables, total, orderMode, splitItems, directPaidAmount]);

  return (
    <div className="relative h-full font-display">
      {/* Overlay de Caixa Fechado */}
      {!isCashierOpen && (
        <div className="absolute inset-0 z-50 bg-slate-50/80 dark:bg-background-dark/90 backdrop-blur-md flex items-center justify-center p-6 rounded-[40px] animate-fadeIn">
          <div className="bg-white dark:bg-surface-dark p-12 rounded-[48px] shadow-2xl border border-slate-200 dark:border-white/5 flex flex-col items-center text-center max-w-md">
            <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-5xl text-slate-400">lock</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 leading-none">Vendas Bloqueadas</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">
              O turno atual não foi iniciado. É necessário abrir o caixa para realizar vendas e gerenciar mesas.
            </p>
            <button
              onClick={onOpenCashier}
              className="w-full py-5 bg-primary text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">key</span>
              Abrir Caixa Agora
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-6 lg:h-full lg:overflow-hidden animate-fadeIn relative font-display text-slate-900 dark:text-slate-100 ${!isCashierOpen ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="fixed top-20 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
          {toasts.map(toast => (
            <div key={toast.id} className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fadeIn border backdrop-blur-md pointer-events-auto ${toast.type === 'success' ? 'bg-primary/90 text-slate-900 border-primary/20' :
              toast.type === 'info' ? 'bg-blue-600/90 text-white border-blue-500/20' : 'bg-red-600/90 text-white border-red-500/20'
              }`}>
              <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'info'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-6 lg:overflow-hidden min-h-[600px] lg:min-h-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex border border-slate-200/50 dark:border-slate-800">
              <button
                onClick={() => setViewMode('CATALOG')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'CATALOG' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
              >
                Catálogo
              </button>
              <button
                onClick={() => setViewMode('TABLES')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'TABLES' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
              >
                Mapa de Mesas
                {Object.keys(openTables).length > 0 && (
                  <span className="size-4 bg-primary text-slate-900 text-[8px] flex items-center justify-center rounded-full">{Object.keys(openTables).length}</span>
                )}
              </button>
            </div>

            <div className="relative flex-1 max-w-md w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                placeholder={viewMode === 'CATALOG' ? "Buscar item no catálogo..." : "Buscar mesa ou cliente..."}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {viewMode === 'CATALOG' ? (
            <>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${categoryFilter === cat ? 'bg-slate-900 dark:bg-primary text-white dark:text-slate-900 border-transparent shadow-lg' : 'bg-white dark:bg-surface-dark text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-6 custom-scrollbar content-start">
                {products.map(product => (
                  <button
                    key={product.id}
                    disabled={product.stock <= 0}
                    onClick={() => { addToCart(product); addToast(`${product.name} add.`); }}
                    className={`group bg-white dark:bg-surface-dark p-4 rounded-[32px] border transition-all text-left active:scale-[0.97] shadow-sm flex flex-col ${product.stock <= 0 ? 'opacity-40 grayscale cursor-not-allowed border-transparent' : 'border-slate-100 dark:border-slate-800 hover:border-primary'
                      }`}
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50 dark:bg-slate-900 relative">
                      <img src={product.imageUrl || 'https://placehold.co/400x400?text=No+Image'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 px-1">
                      <h4 className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate uppercase tracking-tight">{product.name}</h4>
                      <p className="mt-1 text-primary-dark dark:text-primary font-black text-[18px]">R$ {(Number(product.price) || 0).toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 custom-scrollbar content-start">
              {Object.values(openTables).map((table: Table) => {
                return (
                  <div key={table.id} className="bg-white dark:bg-surface-dark rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="size-14 bg-slate-100 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mesa</span>
                        <span className="text-2xl font-black dark:text-white leading-none mt-1">{table.tableNumber}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Subtotal</p>
                        <p className="text-2xl font-black dark:text-white">R$ {(Number(table.totalAmount) || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        {table.user ? (
                          <>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase dark:text-white truncate">{table.user.name}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Desde {new Date(table.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="material-symbols-outlined text-lg">person_off</span>
                            <span className="text-[9px] font-black uppercase">Consumidor Avulso</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        onClick={() => { setOrderMode('TABLE'); setTableNumber(table.tableNumber); loadTable(table.tableNumber); setViewMode('CATALOG'); }}
                        className="h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                      >
                        Abrir Comanda
                      </button>
                      <button
                        onClick={() => { setTableNumber(table.tableNumber); setOrderMode('TABLE'); setIsSplitModalOpen(true); }}
                        className="h-11 bg-primary hover:bg-primary-dark text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/10"
                      >
                        Fechar / Dividir
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={async () => {
                  try {
                    const tableNumber = prompt('Digite o número da mesa:');
                    if (tableNumber && tableNumber.trim()) {
                      await tableService.openTable({ tableNumber: tableNumber.trim() });
                      addToast(`Mesa ${tableNumber} aberta com sucesso!`, 'success');
                      // Recarregar mesas
                      const tables = await tableService.getOpenTables();
                      const tablesMap: Record<string, Table> = {};
                      tables.forEach((table: Table) => {
                        tablesMap[table.tableNumber] = table;
                      });
                      setOpenTables(tablesMap);
                    }
                  } catch (error: any) {
                    console.error('Error opening table:', error);

                    // Handle specific error cases
                    if (error.response?.status === 400) {
                      if (error.response?.data?.message?.includes('já está aberta')) {
                        addToast(`Mesa ${tableNumber} já está aberta!`, 'error');
                      } else {
                        addToast(error.response?.data?.message || 'Erro ao abrir mesa', 'error');
                      }
                    } else {
                      addToast('Erro ao abrir mesa', 'error');
                    }
                  }
                }}
                className="bg-slate-50 dark:bg-slate-900/20 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-primary hover:text-primary transition-all group"
              >
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Abrir Nova Mesa</span>
              </button>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-[440px] bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden shrink-0 order-2 lg:order-none mt-6 lg:mt-0 h-[600px] lg:h-auto">
          <div className="px-6 md:px-10 pt-6 md:pt-10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px] font-black">shopping_basket</span>
              </div>
              <h3 className="text-[14px] font-black uppercase tracking-widest dark:text-white">Carrinho</h3>
            </div>
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="size-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[24px]">logout</span>
            </button>
          </div>

          <div className="p-1.5 mx-6 md:mx-10 mt-8 bg-slate-100 dark:bg-slate-900 rounded-2xl flex gap-1 shrink-0 border border-slate-200/50 dark:border-white/5">
            <button
              onClick={() => handleSwitchOrderMode('DIRECT')}
              className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${orderMode === 'DIRECT' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-400'}`}
            >
              Venda Balcão
            </button>
            <button
              onClick={() => handleSwitchOrderMode('TABLE')}
              className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${orderMode === 'TABLE' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-400'}`}
            >
              Lançar Mesa
            </button>
          </div>

          <div className="px-8 mt-6 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-4">
              <div className={orderMode === 'TABLE' ? 'grid grid-cols-[100px_1fr] gap-3' : 'w-full'}>
                {orderMode === 'TABLE' && (
                  <div className="relative animate-fadeIn">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 text-center">Mesa</label>
                    <input
                      type="text"
                      placeholder="Nº"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value.toUpperCase())}
                      onBlur={() => loadTable(tableNumber)}
                      className="w-full px-3 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-black uppercase outline-none focus:ring-4 focus:ring-primary/10 dark:text-white text-center transition-all"
                    />
                  </div>
                )}

                <div className="relative flex-1">
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Atleta Fidelidade
                    </label>
                    <button
                      onClick={() => setIsNewClientModalOpen(true)}
                      className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      + Novo
                    </button>
                  </div>

                  {!selectedUser ? (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar por Nome ou CPF..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[12px] font-black uppercase outline-none focus:ring-4 focus:ring-primary/10 dark:text-white transition-all"
                      />
                      {isSearchingClient && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="material-symbols-outlined animate-spin text-sm text-primary">progress_activity</span>
                        </div>
                      )}

                      {clientSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                          {clientSearchResults.map(client => (
                            <button
                              key={client.id}
                              onClick={() => {
                                setSelectedUser(client);
                                setClientSearch('');
                                setClientSearchResults([]);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-none"
                            >
                              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                                {client.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{client.name}</p>
                                <p className="text-[9px] text-slate-400 font-medium">CPF: {client.cpf || 'N/A'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 border border-primary/30 rounded-xl animate-fadeIn">
                      <img src={selectedUser.avatar} className="size-8 rounded-full border border-white dark:border-slate-800" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{selectedUser.name}</p>
                        <p className="text-[8px] text-primary font-bold uppercase tracking-widest">{selectedUser.level} • {selectedUser.points} pts</p>
                      </div>
                      <button onClick={() => { setSelectedUser(null); setClientSearch(''); }} className="text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-5 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6">
                <span className="material-symbols-outlined text-[90px] font-light">shopping_bag</span>
                <p className="font-black text-[11px] uppercase tracking-[0.3em]">Carrinho Vazio</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.product.id} className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{item.product.name}</p>
                    <p className="text-[11px] text-primary-dark dark:text-primary font-black">R$ {((Number(item.product.price) || 0) * (Number(item.qty) || 0)).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button onClick={() => updateQty(item.product.id, -1)} className="size-7 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><span className="material-symbols-outlined text-lg">remove</span></button>
                    <span className="w-5 text-center text-[12px] font-black dark:text-white">{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} className="size-7 flex items-center justify-center text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined text-lg">add</span></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{directPaidAmount > 0 ? 'Restante a Pagar' : 'Total a Lançar/Pagar'}</p>
                <p className="text-[34px] font-black text-slate-900 dark:text-white leading-none">R$ {(Number(currentTableBalance) || 0).toFixed(2)}</p>
              </div>
              {orderMode === 'TABLE' && tableNumber && openTables[tableNumber] && (
                <div className="text-right">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Total da Mesa</p>
                  <p className="text-[16px] font-black text-slate-900 dark:text-white">R$ {(Number(openTables[tableNumber].totalAmount) || 0).toFixed(2)}</p>
                </div>
              )}
              {orderMode === 'DIRECT' && directPaidAmount > 0 && (
                <div className="text-right">
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Pago: R$ {(Number(directPaidAmount) || 0).toFixed(2)}</p>
                  <p className="text-[12px] font-black text-slate-400 uppercase">Original: R$ {(Number(total) || 0).toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {orderMode === 'TABLE' ? (
                <>
                  <button
                    disabled={items.length === 0 || !tableNumber}
                    onClick={handleLaunchToTable}
                    className="flex-1 h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[12px] uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-[24px]">send_to_mobile</span>
                    Lançar Itens
                  </button>
                  {(tableNumber && (openTables[tableNumber] || items.length > 0)) && (
                    <button onClick={() => { setSplitItems([]); setIsCheckoutOpen(true); }} className="h-16 px-6 bg-primary hover:bg-primary-dark text-slate-900 font-black rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95" title="Fechar Conta Total">
                      <span className="material-symbols-outlined text-[28px]">payments</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  disabled={items.length === 0}
                  onClick={() => { setSplitItems([]); setIsCheckoutOpen(true); }}
                  className="w-full h-16 bg-primary hover:bg-primary-dark disabled:opacity-30 text-slate-900 font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[13px] uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-[26px]">payments</span>
                  Finalizar Venda
                </button>
              )}
            </div>
          </div>
        </aside>

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => { setIsCheckoutOpen(false); setSplitItems([]); }}
          onConfirm={handleFinishOrder}
          totalBalance={currentTableBalance}
          initialClientId={selectedUser?.id}
          tableNumber={orderMode === 'TABLE' ? tableNumber : undefined}
        />

        {isSplitModalOpen && tableNumber && openTables[tableNumber] && (
          <SplitBillModal
            isOpen={isSplitModalOpen}
            onClose={() => setIsSplitModalOpen(false)}
            tableData={{
              id: openTables[tableNumber].id,
              tableNumber: openTables[tableNumber].tableNumber,
              items: openTables[tableNumber].items.map(item => ({
                product: item.product,
                qty: item.quantity
              }))
            }}
            onConfirm={handleSplitConfirm}
          />
        )}

        <ConfirmModal
          isOpen={isClearModalOpen}
          onClose={() => setIsClearModalOpen(false)}
          onConfirm={handleResetPDV}
          title="Limpar Operação"
          message="Deseja limpar o carrinho e desvincular o atendimento atual?"
        />

        <NewClientModal
          isOpen={isNewClientModalOpen}
          onClose={() => setIsNewClientModalOpen(false)}
          onSuccess={(client) => {
            // Convert to User type and select
            const user: User = {
              id: client.id,
              name: client.name,
              email: client.email || '',
              role: 'CLIENT',
              department: 'External',
              status: 'active',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`,
              points: client.points || 0,
              level: 'Prata',
              cpf: client.cpf,
              phone: client.phone
            };
            setSelectedUser(user);
            addToast(`Cliente ${client.name} cadastrado e selecionado!`, 'success');
          }}
        />
      </div>
    </div>
  );
};

export default POSView;
