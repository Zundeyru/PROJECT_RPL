"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/Card";
import Link from "next/link";
import { Users, Store, Box, ShoppingBag, UserPlus, FileCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

function MetricCard({ label, value, icon, color = "bg-primary-subtle text-primary" }: MetricCardProps) {
  return (
    <Card>
      <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center mb-4 shadow-sm`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-text-primary">{value}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-48 bg-border-subtle rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-border-subtle rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-border-subtle rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="h-4 bg-border-subtle rounded w-32 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-border-subtle rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-border-subtle rounded w-32 mb-4" />
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-border-subtle rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState({ buyers: 0, sellers: 0, products: 0, trx: 0, totalRevenue: 0 });
  const [topSellers, setTopSellers] = useState<{ name: string; product: string; volume: number }[]>([]);
  const [chartData, setChartData] = useState<number[]>(new Array(12).fill(0));
  const [growth, setGrowth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<{ type: 'order' | 'user'; label: string; time: Date }[]>([]);

  const computeDashboard = useCallback((orders: any[], buyers: number, sellers: number, products: number) => {
    const trxCount = orders.length;
    const rev = orders.reduce((acc: number, curr: any) => acc + Number(curr.total_amount || curr.totalAmount || curr.price || 0), 0);

    setStats({ buyers, sellers, products, trx: trxCount, totalRevenue: rev });

    const sellerSales: Record<string, { product: string; volume: number; qty: Record<string, number> }> = {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyRev = new Array(12).fill(0);

    orders.forEach((o: any) => {
      const amount = Number(o.total_amount || o.totalAmount || o.price || 0);
      const d = new Date(o.created_at || o.date);
      const monthDiff = (currentYear - d.getFullYear()) * 12 + (currentMonth - d.getMonth());
      if (monthDiff >= 0 && monthDiff < 12) monthlyRev[11 - monthDiff] += amount;

      const sName = o.store_name || o.storeName || "Unknown Store";
      if (!sellerSales[sName]) sellerSales[sName] = { product: "", volume: 0, qty: {} };
      sellerSales[sName].volume += amount;

      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          sellerSales[sName].qty[item.name] = (sellerSales[sName].qty[item.name] || 0) + item.qty;
        });
      } else if (o.product) {
        const prods = o.product.split(", ");
        prods.forEach((p: string) => {
          const parts = p.split("x ");
          const name = parts.length > 1 ? parts[1] : p;
          const qty = parts.length > 1 ? parseInt(parts[0]) : (o.qty || 1);
          sellerSales[sName].qty[name] = (sellerSales[sName].qty[name] || 0) + qty;
        });
      }
    });

    const maxMonth = Math.max(...monthlyRev) || 1;
    setChartData(monthlyRev.map(v => v === 0 ? 0 : Math.max(5, (v / maxMonth) * 100)));

    const currentMonthRev = monthlyRev[11];
    const prevMonthRev = monthlyRev[10];
    let calculatedGrowth = 0;
    if (prevMonthRev > 0) calculatedGrowth = ((currentMonthRev - prevMonthRev) / prevMonthRev) * 100;
    else if (currentMonthRev > 0) calculatedGrowth = 100;
    setGrowth(calculatedGrowth);

    const topArr = Object.keys(sellerSales).map(storeName => {
      const qtyMap = sellerSales[storeName].qty;
      const topProduct = Object.keys(qtyMap).sort((a, b) => qtyMap[b] - qtyMap[a])[0] || "Belum ada produk";
      return { name: storeName, product: topProduct, volume: sellerSales[storeName].volume };
    }).sort((a, b) => b.volume - a.volume).slice(0, 5);

    setTopSellers(topArr.length > 0 ? topArr : [{ name: "Belum Ada Data", product: "-", volume: 0 }]);
  }, []);

  // ── Cached state for realtime re-computation ──────────────────────
  const [ordersCache, setOrdersCache] = useState<any[]>([]);
  const [countsCache, setCountsCache] = useState({ buyers: 0, sellers: 0, products: 0 });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [{ count: buyers }, { count: sellers }, { count: products }, { data: ordersData }] =
        await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }).in("role", ["buyer", "pembeli"]).eq("status", "aktif"),
          supabase.from("users").select("*", { count: "exact", head: true }).in("role", ["seller", "penjual"]).eq("status", "aktif"),
          supabase.from("menus").select("*", { count: "exact", head: true }).eq("isavailable", true),
          supabase.from("orders").select("*").in("status", ["Selesai", "selesai"]),
        ]);

      const orders = ordersData || [];
      const counts = { buyers: buyers || 0, sellers: sellers || 0, products: products || 0 };
      setOrdersCache(orders);
      setCountsCache(counts);
      computeDashboard(orders, counts.buyers, counts.sellers, counts.products);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  }, [computeDashboard]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Realtime: orders → re-compute revenue & top sellers ───────────
  useRealtimeSync({
    table: 'orders',
    channelName: 'rt_admin_dashboard_orders',
    onPayload: (payload) => {
      const { eventType, new: newRow, old: oldRow } = payload as any;
      setOrdersCache((prev) => {
        let updated = prev;
        if (eventType === 'INSERT') {
          const isComplete = newRow.status === 'Selesai' || newRow.status === 'selesai';
          if (isComplete) updated = [newRow, ...prev];
          // Also add to recent activity
          setRecentActivity((a) => [{ type: 'order' as const, label: `Transaksi selesai: #${newRow.id}`, time: new Date() }, ...a].slice(0, 5));
        } else if (eventType === 'UPDATE') {
          const isComplete = newRow.status === 'Selesai' || newRow.status === 'selesai';
          const wasComplete = prev.some((o) => o.id === newRow.id);
          if (isComplete && !wasComplete) {
            updated = [newRow, ...prev];
            setRecentActivity((a) => [{ type: 'order' as const, label: `Transaksi selesai: #${newRow.id}`, time: new Date() }, ...a].slice(0, 5));
          } else if (isComplete) {
            updated = prev.map((o) => (o.id === newRow.id ? { ...o, ...newRow } : o));
          } else {
            updated = prev.filter((o) => o.id !== newRow.id);
          }
        } else if (eventType === 'DELETE') {
          updated = prev.filter((o) => o.id !== oldRow.id);
        }
        computeDashboard(updated, countsCache.buyers, countsCache.sellers, countsCache.products);
        return updated;
      });
    },
  });

  // ── Realtime: users → re-compute buyer/seller counts ──────────────
  useRealtimeSync({
    table: 'users',
    channelName: 'rt_admin_dashboard_users',
    onPayload: () => {
      // Re-fetch only the counts
      Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }).in("role", ["buyer", "pembeli"]).eq("status", "aktif"),
        supabase.from("users").select("*", { count: "exact", head: true }).in("role", ["seller", "penjual"]).eq("status", "aktif"),
      ]).then(([{ count: b }, { count: s }]) => {
        const newCounts = { buyers: b || 0, sellers: s || 0, products: countsCache.products };
        setCountsCache(newCounts);
        computeDashboard(ordersCache, newCounts.buyers, newCounts.sellers, newCounts.products);
        setRecentActivity((a) => [{ type: 'user' as const, label: 'User baru bergabung', time: new Date() }, ...a].slice(0, 5));
      });
    },
  });

  // ── Realtime: menus → update product count ─────────────────────────
  useRealtimeSync({
    table: 'menus',
    channelName: 'rt_admin_dashboard_menus',
    onPayload: () => {
      supabase.from("menus").select("*", { count: "exact", head: true }).eq("isavailable", true)
        .then(({ count: p }) => {
          const newCounts = { ...countsCache, products: p || 0 };
          setCountsCache(newCounts);
          computeDashboard(ordersCache, newCounts.buyers, newCounts.sellers, newCounts.products);
        });
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Revenue Hero Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-9 shadow-[0_12px_40px_rgba(140,90,53,0.3)] border border-primary-light/30">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-bold text-white/80 uppercase tracking-widest">Total Pendapatan</p>
            <span className={`${growth >= 0 ? "bg-[#128C7E]" : "bg-danger"} text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-sm`}>
              {growth >= 0 ? "↗" : "↘"} {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-8 drop-shadow-md">
            {fmt(stats.totalRevenue)}
          </h2>

          <div className="flex items-end gap-2 h-16 opacity-90">
            {chartData.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/20 rounded-t-sm hover:bg-white/50 transition-all duration-300 cursor-pointer"
                style={{ height: `${h}%` }}
                title={`Bulan ke-${i + 1}`}
              />
            ))}
          </div>
          <p className="text-xs text-white/60 mt-3 font-semibold tracking-wide">Data 12 bulan terakhir</p>
        </div>
      </div>

      {/* ── Metric Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard label="Total Pembeli" value={stats.buyers.toLocaleString()} icon={<Users size={22} className="stroke-[2.5]" />} />
        <MetricCard label="Total Penjual" value={stats.sellers} icon={<Store size={22} className="stroke-[2.5]" />} color="bg-blue-50 text-blue-600" />
        <MetricCard label="Total Produk" value={stats.products} icon={<Box size={22} className="stroke-[2.5]" />} color="bg-purple-50 text-purple-600" />
        <MetricCard label="Total Transaksi" value={stats.trx.toLocaleString()} icon={<ShoppingBag size={22} className="stroke-[2.5]" />} color="bg-green-50 text-green-600" />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <Link href="/pembeli" className="flex items-center justify-center gap-3 px-6 py-5 bg-white border border-border-subtle rounded-2xl text-sm font-bold text-text-primary hover:bg-primary-subtle hover:text-primary hover:border-primary/20 transition-all shadow-card hover:shadow-card-hover group">
            <Users size={20} className="text-primary stroke-[2.5] group-hover:scale-110 transition-transform" />
            Kelola Pembeli
          </Link>
          <Link href="/penjual" className="flex items-center justify-center gap-3 px-6 py-5 bg-white border border-border-subtle rounded-2xl text-sm font-bold text-text-primary hover:bg-primary-subtle hover:text-primary hover:border-primary/20 transition-all shadow-card hover:shadow-card-hover group">
            <Store size={20} className="text-primary stroke-[2.5] group-hover:scale-110 transition-transform" />
            Kelola Penjual
          </Link>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Penjual Terbaik */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Penjual Terbaik</p>
            <Link href="/laporan" className="text-xs font-bold text-primary hover:underline">Lihat Semua →</Link>
          </div>
          <div className="space-y-3">
            {topSellers.map((s, i) => (
              <Card key={i} hover className="!py-4 border-border-subtle">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary-subtle text-primary text-sm font-extrabold flex items-center justify-center shadow-inner">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-text-primary">{s.name}</p>
                      <p className="text-xs text-text-muted mt-0.5 font-medium">{s.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Volume Penjualan</p>
                    <p className="font-extrabold text-sm text-text-primary mt-0.5">{fmt(s.volume)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Aktivitas Terbaru - Real-time */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Aktivitas Terbaru</p>
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <Card className="!py-4 border-border-subtle">
                <p className="text-sm text-text-muted text-center font-medium">Menunggu aktivitas baru...</p>
              </Card>
            ) : (
              recentActivity.map((act, i) => (
                <Card key={i} hover className="!py-4 border-border-subtle animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${act.type === 'user' ? 'bg-primary-subtle text-primary' : 'bg-green-50 text-green-600'}`}>
                      {act.type === 'user' ? <UserPlus size={18} className="stroke-[2.5]" /> : <FileCheck size={18} className="stroke-[2.5]" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{act.label}</p>
                      <p className="text-xs text-text-muted mt-1 font-semibold">
                        {act.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
