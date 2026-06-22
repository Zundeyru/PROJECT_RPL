/**
 * PEMBELI — useApi.ts
 * All data-fetching hooks for the Buyer portal, upgraded with Supabase Realtime.
 * Polling has been REMOVED and replaced with WebSocket subscriptions.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// useStores — Real-time store list
// Subscribes to UPDATE on `stores` so Buyers instantly see "Tutup/Buka" changes.
// ─────────────────────────────────────────────
export function useStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      const data = await api.getStores();
      setStores(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();

    // Real-time: ALL changes on stores (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('rt_stores_buyer')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stores' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setStores((prev) => [...prev, { ...payload.new, isOpen: (payload.new as any).is_open !== undefined ? (payload.new as any).is_open : true }]);
          } else if (payload.eventType === 'UPDATE') {
            setStores((prev) =>
              prev.map((s) =>
                s.id === payload.new.id
                  ? { ...s, ...payload.new, isOpen: (payload.new as any).is_open !== undefined ? (payload.new as any).is_open : true }
                  : s
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setStores((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStores]);

  return { stores, isLoading, error, refetch: fetchStores };
}

// ─────────────────────────────────────────────
// useStore — Real-time single store detail
// ─────────────────────────────────────────────
export function useStore(id: string) {
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getStoreById(id);
      setStore(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchStore();

    // Real-time: UPDATE on this specific store
    const channel = supabase
      .channel(`rt_store_${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stores', filter: `id=eq.${id}` },
        (payload) => {
          setStore((prev: any) => ({
            ...prev,
            ...payload.new,
            isOpen: (payload.new as any).is_open,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchStore]);

  return { store, isLoading, error, refetch: fetchStore };
}

// ─────────────────────────────────────────────
// useMenus — Real-time menu list
// Subscribes to UPDATE so out-of-stock items grey out instantly in Buyer view.
// ─────────────────────────────────────────────
export function useMenus(storeId?: string) {
  const [menus, setMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    try {
      const data = storeId
        ? await api.getMenusByStore(storeId)
        : await api.getAllMenus();
      setMenus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchMenus();

    const channelName = storeId ? `rt_menus_store_${storeId}` : 'rt_menus_all';
    const filter = storeId ? `storeid=eq.${storeId}` : undefined;

    const channelBuilder = supabase.channel(channelName).on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'menus',
        ...(filter ? { filter } : {}),
      },
      (payload) => {
        // Optimistic patch: update isavailable/isAvailable in-place
        setMenus((prev) =>
          prev.map((m) =>
            m.id === payload.new.id
              ? {
                  ...m,
                  ...payload.new,
                  isAvailable: (payload.new as any).isavailable,
                  storeId: (payload.new as any).storeid,
                }
              : m
          )
        );
      }
    );

    // Also listen for INSERT/DELETE to keep list fresh
    channelBuilder.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'menus',
        ...(filter ? { filter } : {}),
      },
      () => fetchMenus()
    ).on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'menus',
        ...(filter ? { filter } : {}),
      },
      (payload) => {
        setMenus((prev) => prev.filter((m) => m.id !== payload.old.id));
      }
    );

    const channel = channelBuilder.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, fetchMenus]);

  return { menus, isLoading, error, refetch: fetchMenus };
}

// ─────────────────────────────────────────────
// useBuyerOrders — Real-time order tracking for Buyer
// Subscribes to ALL events on `orders` filtered by buyer_id.
// When seller updates status → Buyer tracking UI moves to next step instantly.
// POLLING HAS BEEN REMOVED.
// ─────────────────────────────────────────────
export function useBuyerOrders(buyerId: string | undefined) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!buyerId) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getOrdersByBuyer(buyerId);
      const sorted = data.sort(
        (a: any, b: any) =>
          new Date(b.created_at || b.date).getTime() -
          new Date(a.created_at || a.date).getTime()
      );
      setOrders(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    if (!buyerId) {
      setIsLoading(false);
      return;
    }

    fetchOrders();

    // Real-time: subscribe to all changes for THIS buyer's orders
    const channel = supabase
      .channel(`rt_orders_buyer_${buyerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `buyer_id=eq.${buyerId}`,
        },
        (payload) => {
          // Optimistic status update — no refetch needed
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
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `buyer_id=eq.${buyerId}`,
        },
        (payload) => {
          // Prepend new order optimistically
          setOrders((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buyerId, fetchOrders]);

  return { orders, isLoading, refetch: fetchOrders };
}
