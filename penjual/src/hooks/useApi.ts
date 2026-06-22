/**
 * PENJUAL — useApi.ts
 * All data-fetching hooks for the Seller portal, upgraded with Supabase Realtime.
 * Polling has been REMOVED and replaced with WebSocket subscriptions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// useSellerStore — Real-time store info
// ─────────────────────────────────────────────
export function useSellerStore(sellerId: string | null) {
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    if (!sellerId) return;
    try {
      let data = await api.getStoreBySeller(sellerId);
      if (!data) {
        console.warn('Store not found in hook, creating automatically...');
        const userStr = localStorage.getItem('umm_active_user');
        const u = userStr ? JSON.parse(userStr) : {};
        data = await api.createStore({
          sellerId: sellerId,
          name: u.storeName || u.name || 'Toko Saya',
        });
      }
      setStore(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId) return;
    fetchStore();
  }, [sellerId, fetchStore]);

  return { store, isLoading, error, setStore };
}

// ─────────────────────────────────────────────
// useSellerMenus — Real-time menu management
// INSERT/UPDATE/DELETE instantly reflected in Seller's menu list.
// ─────────────────────────────────────────────
export function useSellerMenus(storeId: string | null) {
  const [menus, setMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getMenusByStore(storeId);
      setMenus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchMenus();

    if (!storeId) return;

    const channel = supabase
      .channel(`rt_menus_seller_${storeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'menus',
          filter: `storeid=eq.${storeId}`,
        },
        (payload) => {
          const newMenu = {
            ...payload.new,
            storeId: (payload.new as any).storeid,
            isAvailable: (payload.new as any).isavailable,
          };
          setMenus((prev) => [...prev, newMenu]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'menus',
          filter: `storeid=eq.${storeId}`,
        },
        (payload) => {
          setMenus((prev) =>
            prev.map((m) =>
              m.id === payload.new.id
                ? {
                    ...m,
                    ...payload.new,
                    storeId: (payload.new as any).storeid,
                    isAvailable: (payload.new as any).isavailable,
                  }
                : m
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'menus',
          filter: `storeid=eq.${storeId}`,
        },
        (payload) => {
          setMenus((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, fetchMenus]);

  return { menus, isLoading, error, mutateMenus: fetchMenus };
}

// ─────────────────────────────────────────────
// useSellerOrders — Real-time order management for Seller
//
// Key behaviours:
// 1. INSERT with status='Baru' → prepend to list + fire toast callback
// 2. UPDATE → optimistically patch the order in state
// 3. DELETE → remove from list
//
// The onNewOrder callback is provided by the caller (KelolaPesanan page)
// and is used to trigger the 60-second notification toast.
// ─────────────────────────────────────────────
export function useSellerOrders(
  storeId: string | null,
  onNewOrder?: (order: any) => void
) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep onNewOrder in a ref so the subscription closure always has the latest version
  const onNewOrderRef = useRef(onNewOrder);
  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  });

  const fetchOrders = useCallback(async () => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getOrdersByStore(storeId);
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) setIsLoading(true);
    fetchOrders();

    if (!storeId) return;

    const channel = supabase
      .channel(`rt_orders_seller_${storeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const newOrder = payload.new as any;
          // Prepend new order to state
          setOrders((prev) => [newOrder, ...prev]);
          // Trigger toast notification via callback if order is 'Baru'
          if (
            (newOrder.status === 'Baru' || newOrder.status === 'baru') &&
            onNewOrderRef.current
          ) {
            onNewOrderRef.current(newOrder);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id ? { ...o, ...payload.new } : o
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, fetchOrders]);

  return { orders, isLoading, error, setOrders, mutateOrders: fetchOrders };
}
