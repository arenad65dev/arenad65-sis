
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Product } from '../types';

export const useCart = () => {
  const [items, setItems] = useState<{ product: Product; qty: number }[]>(() => {
    const saved = localStorage.getItem('arena_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('arena_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.product.id === productId) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  }, [items]);

  // Exporting setItems to allow manual state updates (e.g., when loading a table's items)
  return { items, addToCart, removeFromCart, updateQty, clearCart, total, setItems };
};
