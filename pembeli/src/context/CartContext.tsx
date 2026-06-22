"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartProduct {
  id: string;        // menu ID
  storeId: string;
  name: string;
  price: number;     // price from DB at time of adding
  image?: string;
  category?: string;
}

export interface CartItem {
  id: string;        // unique cart item ID
  product: CartProduct;
  quantity: number;
  notes: string;
  selected: boolean;
}

interface CartContextType {
  items: CartItem[];
  isHydrated: boolean;
  addToCart: (product: CartProduct, quantity?: number, notes?: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateNotes: (id: string, notes: string) => void;
  toggleSelection: (id: string) => void;
  toggleStoreSelection: (storeId: string, selectAll: boolean) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  clearSelectedItems: () => void;
  totalItems: number;
  selectedTotal: number;
}

const CART_STORAGE_KEY = 'ekantin_cart_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate cart from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist cart to localStorage whenever items change (only after hydrated)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      // Don't persist base64 images — they bloat storage. Strip them before saving.
      const toStore = items.map(item => ({
        ...item,
        product: {
          ...item.product,
          image: item.product.image?.startsWith('data:') ? undefined : item.product.image,
        }
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [items, isHydrated]);

  const addToCart = (product: CartProduct, quantity = 1, notes = "") => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.notes === notes);
      if (existing) {
        return prev.map(item =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: `${product.id}-${Date.now()}`, product, quantity, notes, selected: true }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateNotes = (id: string, notes: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  const toggleSelection = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const toggleStoreSelection = (storeId: string, selectAll: boolean) => {
    setItems(prev => prev.map(item => item.product.storeId === storeId ? { ...item, selected: selectAll } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch {}
  };

  const clearSelectedItems = () => {
    setItems(prev => prev.filter(item => !item.selected));
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Calculate total only for selected items — using live price from CartProduct
  const selectedTotal = items
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      isHydrated,
      addToCart,
      updateQuantity,
      updateNotes,
      toggleSelection,
      toggleStoreSelection,
      removeItem,
      clearCart,
      clearSelectedItems,
      totalItems,
      selectedTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
