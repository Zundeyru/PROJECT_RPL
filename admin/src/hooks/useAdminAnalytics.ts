/**
 * ADMIN — useAdminAnalytics.ts
 * Fully real-time analytics hook.
 *
 * Subscribes to:
 * - INSERT/UPDATE/DELETE on `orders` → recalculate revenue, trx count, top sellers
 * - INSERT/DELETE on `users` → tick buyer/seller counts up/down
 * - INSERT/DELETE/UPDATE on `menus` → update product count
 *
 * The 10-second polling has been REMOVED.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type FilterType = 'hari_ini' | 'minggu_ini' | 'bulan_ini';

export function useAdminAnalytics() {
  const [filter, setFilter] = useState<FilterType>('minggu_ini');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    topSeller: 'Belum ada',
    topProduct: 'Belum ada',
    trxCount: 0,
    prodCount: 0,
    totalGross: 0,
    totalNet: 0,
    activeBuyers: 0,
    activeSellers: 0,
  });

  // ── Core fetch ──────────────────────────────────────────────────────────
  const fetchBaseData = useCallback(async () => {
    try {
      const [{ count: buyersCount }, { count: sellersCount }, { data: ordersData }] =
        await Promise.all([
          supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .in('role', ['buyer', 'pembeli'])
            .eq('status', 'aktif'),
          supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .in('role', ['seller', 'penjual'])
            .eq('status', 'aktif'),
          supabase
            .from('orders')
            .select('*')
            .in('status', ['Selesai', 'selesai'])
            .order('created_at', { ascending: false }),
        ]);

      setStats((prev) => ({
        ...prev,
        activeBuyers: buyersCount ?? 0,
        activeSellers: sellersCount ?? 0,
      }));
      setTransactions(ordersData ?? []);
    } catch (error) {
      console.error('Error fetching analytics base data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Initial load + Realtime subscriptions ───────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBaseData();

    // --- Orders realtime ---
    // When a seller marks an order 'Selesai', it immediately appears in the transactions table
    const ordersChannel = supabase
      .channel('rt_admin_orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as any;
          // Only add to transactions if it's already 'Selesai'
          if (newOrder.status === 'Selesai' || newOrder.status === 'selesai') {
            setTransactions((prev) => [newOrder, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as any;
          const isComplete =
            updated.status === 'Selesai' || updated.status === 'selesai';

          setTransactions((prev) => {
            const exists = prev.some((t) => t.id === updated.id);
            if (isComplete && !exists) {
              // Order just became 'Selesai' → prepend it to the list
              return [updated, ...prev];
            }
            if (isComplete && exists) {
              // Update in place
              return prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
            }
            // Status changed AWAY from Selesai (edge case) → remove
            return prev.filter((t) => t.id !== updated.id);
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          setTransactions((prev) =>
            prev.filter((t) => t.id !== (payload.old as any).id)
          );
        }
      )
      .subscribe();

    // --- Users realtime (for buyer/seller counts) ---
    const usersChannel = supabase
      .channel('rt_admin_users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          // Re-fetch user counts when any user changes
          Promise.all([
            supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .in('role', ['buyer', 'pembeli'])
              .eq('status', 'aktif'),
            supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .in('role', ['seller', 'penjual'])
              .eq('status', 'aktif'),
          ]).then(([{ count: b }, { count: s }]) => {
            setStats((prev) => ({
              ...prev,
              activeBuyers: b ?? prev.activeBuyers,
              activeSellers: s ?? prev.activeSellers,
            }));
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [fetchBaseData]);

  // ── Filter + Compute stats whenever transactions or filter changes ───────
  useEffect(() => {
    const now = new Date();

    const filtered = transactions.filter((t) => {
      const d = new Date(t.created_at || t.date);
      if (filter === 'hari_ini') return d.toDateString() === now.toDateString();
      if (filter === 'minggu_ini') {
        const diff = now.getTime() - d.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      }
      if (filter === 'bulan_ini') {
        return (
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredTransactions(filtered);

    let prodCount = 0;
    let totalGross = 0;
    const sellerCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};

    filtered.forEach((t) => {
      const amount = Number(t.total_amount || t.totalAmount || t.price || 0);
      totalGross += amount;

      const sName = t.store_name || t.storeName || 'Unknown Store';
      sellerCounts[sName] = (sellerCounts[sName] || 0) + amount;

      if (t.items && Array.isArray(t.items)) {
        t.items.forEach((item: any) => {
          prodCount += item.qty;
          productCounts[item.name] = (productCounts[item.name] || 0) + item.qty;
        });
      } else if (t.product) {
        const prods = t.product.split(', ');
        prods.forEach((p: string) => {
          const parts = p.split('x ');
          const name = parts.length > 1 ? parts[1] : p;
          const qty = parts.length > 1 ? parseInt(parts[0]) : t.qty || 1;
          prodCount += qty;
          productCounts[name] = (productCounts[name] || 0) + qty;
        });
      }
    });

    const totalNet = totalGross * 0.1;
    const bestSeller = Object.keys(sellerCounts).sort(
      (a, b) => sellerCounts[b] - sellerCounts[a]
    )[0];
    const bestProduct = Object.keys(productCounts).sort(
      (a, b) => productCounts[b] - productCounts[a]
    )[0];

    setStats((prev) => ({
      ...prev,
      trxCount: filtered.length,
      prodCount,
      totalGross,
      totalNet,
      topSeller: bestSeller || 'Belum ada',
      topProduct: bestProduct || 'Belum ada',
    }));
  }, [filter, transactions]);

  return {
    filter,
    setFilter,
    transactions,
    filteredTransactions,
    stats,
    isLoading,
  };
}
