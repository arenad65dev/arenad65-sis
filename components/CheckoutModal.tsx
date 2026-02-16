
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_USERS } from '../constants';
import { User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { paymentMethod: string; orderType: string; table: string; clientId: string; amountToPay: number; isPartial: boolean }) => void;
  totalBalance: number;
  initialClientId?: string;
  tableNumber?: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onConfirm, totalBalance, initialClientId, tableNumber }) => {
  const [paymentMode, setPaymentMode] = useState<'TOTAL' | 'PARTIAL'>('TOTAL');
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedPayer, setSelectedPayer] = useState<User | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmountToPay(totalBalance);
      setPaymentMode('TOTAL');
      if (initialClientId) {
        const client = MOCK_USERS.find(u => u.id === initialClientId);
        if (client) { setSelectedPayer(client); setClientSearch(client.id); }
      } else { setSelectedPayer(null); setClientSearch(''); }
    }
  }, [isOpen, initialClientId, totalBalance]);

  useEffect(() => {
    if (!clientSearch) { setSelectedPayer(null); return; }
    const byId = MOCK_USERS.find(u => u.id === clientSearch);
    if (byId) { setSelectedPayer(byId); } else if (clientSearch.length > 2) {
      const byName = MOCK_USERS.find(u => u.name.toLowerCase().includes(clientSearch.toLowerCase()));
      if (byName) setSelectedPayer(byName);
    }
  }, [clientSearch]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex justify-center items-start p-4 overflow-y-auto pt-8 md:pt-20">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn flex flex-col border border-white/10 mb-10">
        <div className="px-5 py-6 md:px-8 md:pt-8 md:pb-4 flex justify-between items-start bg-slate-50/30 dark:bg-slate-900/10 shrink-0">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Checkout</h2>
            <div className="inline-flex px-3 py-1 bg-blue-100/50 text-blue-600 dark:bg-blue-900/40 text-[10px] font-black uppercase rounded-lg border border-blue-200/50 dark:border-blue-800 tracking-widest self-start">
              {tableNumber ? `Mesa ${tableNumber}` : 'Venda Balcão'}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">R$ {(Number(totalBalance) || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="p-5 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
              <div className="flex h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 border border-slate-200/50 dark:border-slate-800">
                <button onClick={() => { setPaymentMode('TOTAL'); setAmountToPay(totalBalance); }} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMode === 'TOTAL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>Total</button>
                <button onClick={() => setPaymentMode('PARTIAL')} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMode === 'PARTIAL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>Parcial</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor</label>
              <input type="number" disabled={paymentMode === 'TOTAL'} className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl text-lg font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white disabled:opacity-60" value={amountToPay} onChange={(e) => setAmountToPay(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Atleta Fidelidade</label>
            <div className="flex gap-2">
              <input type="text" placeholder="ID ou Nome..." className="flex-1 h-12 px-5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 rounded-2xl text-[10px] font-black uppercase dark:text-white" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
              {selectedPayer && <div className="flex items-center gap-2 px-3 h-12 bg-primary/10 border border-primary/20 rounded-2xl shrink-0"><img src={selectedPayer.avatar} className="size-6 rounded-full" /><p className="text-[8px] font-black uppercase dark:text-white">+{Math.floor(amountToPay * 2)} pts</p></div>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['PIX', 'CARTÃO', 'DINHEIRO'].map(opt => (
              <button key={opt} onClick={() => setPaymentMethod(opt)} className={`h-16 rounded-2xl border-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${paymentMethod === opt ? 'border-primary bg-primary/5 text-primary-dark shadow-sm' : 'border-slate-100 dark:border-slate-800 text-slate-300 hover:border-slate-200'}`}>{opt}</button>
            ))}
          </div>

          <div className="pt-4 flex gap-3">
            <button onClick={onClose} className="flex-1 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-[11px] uppercase tracking-widest rounded-2xl text-slate-500">Voltar</button>
            <button disabled={amountToPay <= 0} onClick={() => onConfirm({ paymentMethod, orderType: 'VENDA', table: tableNumber || '', clientId: selectedPayer?.id || '', amountToPay, isPartial: paymentMode === 'PARTIAL' })} className="flex-[1.5] h-14 bg-primary text-slate-900 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">Pagar R$ {(Number(amountToPay) || 0).toFixed(2)}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CheckoutModal;
