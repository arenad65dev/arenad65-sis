
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  initialData?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Bebidas',
    price: 0,
    purchasePrice: 0,
    margin: 0,
    stock: 0,
    minStock: 0,
    sku: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        category: 'Bebidas',
        price: 0,
        purchasePrice: 0,
        margin: 0,
        stock: 0,
        minStock: 10,
        sku: `SKU-${Math.floor(Math.random() * 10000)}`,
        image: '',
        description: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handlePriceChange = (value: number) => {
    const cost = formData.purchasePrice || 0;
    let newMargin = 0;
    if (cost > 0) {
      newMargin = ((value - cost) / cost) * 100;
    }
    setFormData({ ...formData, price: value, margin: parseFloat((Number(newMargin) || 0).toFixed(2)) });
  };

  const handleCostChange = (value: number) => {
    const price = formData.price || 0;
    let newMargin = 0;
    if (value > 0) {
      newMargin = ((price - value) / value) * 100;
    }
    setFormData({ ...formData, purchasePrice: value, margin: parseFloat((Number(newMargin) || 0).toFixed(2)) });
  };

  const handleMarginChange = (value: number) => {
    const cost = formData.purchasePrice || 0;
    const newPrice = cost * (1 + value / 100);
    setFormData({ ...formData, margin: value, price: parseFloat((Number(newPrice) || 0).toFixed(2)) });
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

      {/* Modal Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-surface-dark w-full max-w-4xl max-h-[90vh] rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col md:flex-row border border-white/20"
      >
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Coluna Esquerda: Dados Gerais */}
        <div className="flex-1 p-4 md:p-8 lg:p-12 space-y-6 md:space-y-8 border-r border-slate-100 dark:border-slate-800 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl font-black">inventory_2</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                {initialData ? 'Editar Item' : 'Novo Produto'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão de Inventário Arena</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome do Produto</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Heineken Long Neck 330ml"
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Categoria</label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white appearance-none"
                  >
                    <option>Bebidas</option>
                    <option>Comidas</option>
                    <option>Equipamentos</option>
                    <option>Limpeza / Manut.</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Preço de Venda (R$)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onFocus={handleFocus}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Preço de Aquisição (R$)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice || 0}
                    onFocus={handleFocus}
                    onChange={(e) => handleCostChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Margem (%)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">%</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.margin || 0}
                    onFocus={handleFocus}
                    onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-black dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">SKU / Código</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">URL da Imagem</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm font-medium dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Controle de Estoque */}
        <div className="w-full md:w-[380px] bg-slate-50/80 dark:bg-slate-900/40 p-6 md:p-12 flex flex-col gap-8 overflow-y-auto custom-scrollbar border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Controle de Estoque</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">Defina os limites de segurança para alertas inteligentes</p>
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Estoque Atual</label>
              <div className="flex items-center justify-between gap-4">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, stock: Math.max(0, (prev.stock || 0) - 1) }))} className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shadow-sm">-</button>
                <input
                  type="number"
                  value={formData.stock}
                  onFocus={handleFocus}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-24 bg-transparent text-center text-5xl font-black dark:text-white outline-none"
                />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, stock: (prev.stock || 0) + 1 }))} className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shadow-sm">+</button>
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 text-center">Mínimo (Alerta)</label>
              <input
                type="number"
                value={formData.minStock}
                onFocus={handleFocus}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-2xl font-black dark:text-white text-center outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
              <div className="mt-4 flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                <span className="material-symbols-outlined text-red-500 text-sm">info</span>
                <p className="text-[9px] text-red-500 font-bold uppercase tracking-tight leading-relaxed">
                  Alerta automático ao atingir {formData.minStock} unidades no sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 space-y-3">
            <button type="submit" className="w-full py-5 bg-primary text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              {initialData ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
            <button type="button" onClick={onClose} className="w-full py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
              Descartar
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default ProductModal;
