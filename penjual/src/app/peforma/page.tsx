"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, Trophy, MoreHorizontal, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { api } from '@/services/api';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function PeformaToko() {
  const [showOptions, setShowOptions] = useState(false);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [dataChart, setDataChart] = useState<Record<string, unknown>[]>([]);
  const [topMenu, setTopMenu] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Helper function to get Monday and Sunday of a given date
  const getWeekRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  const processOrders = useCallback(async (myStoreId: string, date: string) => {
    // Fetch orders for this store
    const rawData = await api.getOrdersByStore(myStoreId);
    const data = rawData.filter((o: any) => o.status === "Selesai" || o.status === "selesai");
    
    // Calculate Daily Sales for the Chart (Monday to Sunday of selected week)
    const { monday: startDate, sunday: endDate } = getWeekRange(date);
    const dailyData: Record<string, number> = {};
    
    // Initialize Monday to Sunday with 0
    for (let i = 0; i <= 6; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dayName = d.toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short' });
      dailyData[dayName] = 0;
    }

    // Filter orders within the selected 7-day range
    const filteredData = data.filter((order: Record<string, unknown>) => {
      const d = new Date((order.created_at || order.date) as string);
      return d >= startDate && d <= endDate;
    });

    // Calculate Totals using filtered data
    const totalRev = filteredData.reduce((sum: number, order: Record<string, unknown>) => sum + Number(order.total_amount || order.totalAmount || order.price || 0), 0);
    setTotalPendapatan(totalRev);
    setTotalTransaksi(filteredData.length);

    filteredData.forEach((order: Record<string, unknown>) => {
      const d = new Date((order.created_at || order.date) as string);
      const dayName = d.toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short' });
      if (dailyData[dayName] !== undefined) {
        dailyData[dayName] += Number(order.total_amount || order.totalAmount || order.price || 0);
      }
    });

    const chartArr = Object.keys(dailyData).map(k => ({ day: k, sales: dailyData[k] / 1000 }));
    setDataChart(chartArr);

    // Parse top menus from items array schema
    const menuCount: Record<string, { qty: number, rev: number }> = {};
    filteredData.forEach((order: Record<string, unknown>) => {
      const orderItems = order.items as Array<{ name: string; qty: number; priceAtTime: number }> | undefined;
      if (orderItems && Array.isArray(orderItems)) {
        orderItems.forEach(item => {
          const name = item.name;
          const qty = item.qty;
          const rev = item.priceAtTime * qty;
          if (!menuCount[name]) menuCount[name] = { qty: 0, rev: 0 };
          menuCount[name].qty += qty;
          menuCount[name].rev += rev;
        });
      } else {
        const prods = ((order.product as string) || "").split(", ");
        prods.forEach((p: string) => {
          const parts = p.split("x ");
          const qty = parts.length > 1 ? parseInt(parts[0]) : (order.qty as number || 1);
          const name = parts.length > 1 ? parts[1] : p;
          if (!menuCount[name]) menuCount[name] = { qty: 0, rev: 0 };
          menuCount[name].qty += qty;
          menuCount[name].rev += (Number(order.total_amount || order.price || 0) / (order.qty as number || 1)) * qty;
        });
      }
    });

    const topArr = Object.keys(menuCount)
      .map((k, i) => ({ id: i + 1, name: k, qty: menuCount[k].qty, revenue: menuCount[k].rev }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item, idx) => ({ ...item, id: idx + 1 }));
      
    setTopMenu(topArr.length > 0 ? topArr : [
      { id: 1, name: "Belum Ada Data", qty: 0, revenue: 0 }
    ]);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userStr = localStorage.getItem("umm_active_user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        // Get the seller's store first
        const storeData = await api.getStoreBySeller(user.id);
        if (!storeData) return;
        setStoreId(storeData.id);
        await processOrders(storeData.id, selectedDate);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    fetchOrders();
  }, [selectedDate, processOrders]);

  // ── Realtime: subscribe to order updates for this store ───────────────
  // Whenever an order's status changes to 'Selesai', metrics recalculate instantly.
  useRealtimeSync({
    table: 'orders',
    filter: storeId ? `store_id=eq.${storeId}` : undefined,
    event: 'UPDATE',
    channelName: storeId ? `rt_peforma_${storeId}` : undefined,
    enabled: !!storeId,
    onPayload: (payload) => {
      const updated = payload.new as any;
      if (updated.status === 'Selesai' || updated.status === 'selesai') {
        // An order just became Selesai → re-compute performance metrics
        processOrders(storeId!, selectedDate);
      }
    },
  });



  // Format date range string for display next to the input
  const { monday, sunday } = getWeekRange(selectedDate);
  const dateRangeStr = `${monday.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Laporan Mingguan (Senin - Minggu)</label>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-surface px-4 py-2.5 rounded-xl border border-sidebar-border shadow-sm hover:border-brand/50 transition-colors font-semibold text-brand outline-none"
            />
            <span className="text-sm font-medium text-text-muted hidden md:inline-block">({dateRangeStr})</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 relative">
          <p className="text-xs text-text-muted text-right max-w-[120px]">
            Diperbarui secara real-time
          </p>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 bg-surface border border-sidebar-border rounded-xl text-text-muted hover:text-brand hover:bg-brand-light transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>

          {showOptions && (
            <div className="absolute right-0 top-12 bg-surface border border-sidebar-border shadow-lg rounded-xl overflow-hidden z-10 w-32 animate-in fade-in slide-in-from-top-2">
              <button className="w-full text-left px-4 py-3 hover:bg-brand-light text-sm font-semibold text-text-primary flex items-center gap-2 transition-colors">
                <Download size={16} /> Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-sidebar-border flex flex-col justify-center items-center text-center hover:border-brand/30 transition-colors">
          <p className="text-sm font-bold text-text-secondary mb-1">Total Pendapatan</p>
          <h2 className="text-xl lg:text-2xl font-black text-text-primary">
            Rp {totalPendapatan.toLocaleString("id-ID")}
          </h2>
        </div>
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-sidebar-border flex flex-col justify-center items-center text-center hover:border-brand/30 transition-colors">
          <p className="text-sm font-bold text-text-secondary mb-1">Total Transaksi</p>
          <h2 className="text-xl lg:text-2xl font-black text-text-primary">
            {totalTransaksi}
          </h2>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface p-5 lg:p-6 rounded-2xl shadow-sm border border-sidebar-border">
        <h3 className="font-bold text-lg text-text-primary mb-6">Tren Penjualan Harian (dalam Ribuan)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8D5C4" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666666', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666666', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(160, 91, 42, 0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: any) => [`Rp ${Number(value * 1000).toLocaleString("id-ID")}`, "Pendapatan"]}
              />
              <Bar 
                dataKey="sales" 
                fill="var(--color-brand)" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 Menu */}
      <div className="bg-surface rounded-2xl shadow-sm border border-sidebar-border overflow-hidden">
        <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
          <Trophy className="text-brand" size={24} />
          <h3 className="font-bold text-lg text-text-primary">Menu Terlaris Minggu Ini</h3>
        </div>
        <div className="p-5 space-y-4">
          {topMenu.map((menu, index) => (
            <div key={menu.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-sidebar-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${
                  index === 0 ? "bg-amber-500" :
                  index === 1 ? "bg-slate-400" :
                  index === 2 ? "bg-amber-700" : "bg-brand"
                }`}>
                  {menu.id}
                </div>
                <h4 className="font-bold text-text-primary text-sm lg:text-base">{menu.name}</h4>
              </div>
              <div className="text-right">
                <p className="font-bold text-text-primary text-sm">{menu.qty} Porsi</p>
                <p className="text-xs font-semibold text-text-muted mt-0.5">Rp. {Math.round(menu.revenue).toLocaleString("id-ID")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
