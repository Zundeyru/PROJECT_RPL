"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, Calendar, Bell, X } from "lucide-react";
import { useSellerOrders } from '@/hooks/useApi';
import { api } from '@/services/api';
import { OrderSkeleton } from '@/components/Skeletons';

type Tab = "Baru" | "Diproses" | "Siap Diambil" | "Selesai";

interface OrderItem {
  name: string;
  qty: number;
}

interface Order {
  id: string;
  storeId: string;
  buyerName: string;
  status: string;
  items: OrderItem[];
  total: number;
  time: string;
  date: string;
}

export default function KelolaPesanan() {
  const [activeTab, setActiveTab] = useState<Tab>("Baru");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('umm_active_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      api.getStoreBySeller(u.id).then(data => {
        if (data) setStoreId(data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  // onNewOrder callback: called by useSellerOrders exactly when Supabase fires an INSERT
  const handleNewOrder = useCallback((order: any) => {
    setToastMsg(`Pesanan baru masuk! #${order.id}`);
    // Clear any previous timer and set a fresh 60-second one
    setToastTimer((prev) => {
      if (prev) clearTimeout(prev);
      return setTimeout(() => setToastMsg(null), 60000);
    });
  }, []);

  const { orders, isLoading, setOrders, mutateOrders } = useSellerOrders(storeId, handleNewOrder);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, [toastTimer]);

  const tabs: Tab[] = ["Baru", "Diproses", "Siap Diambil", "Selesai"];
  const currentOrders = (orders || []).filter((o: any) => o.status === activeTab);

  const getStatusColor = (status: Tab) => {
    switch (status) {
      case "Baru": return "text-danger";
      case "Diproses": return "text-warning";
      case "Siap Diambil": return "text-success";
      case "Selesai": return "text-success";
    }
  };

  const getStatusDot = (status: Tab) => {
    switch (status) {
      case "Baru": return "bg-danger";
      case "Diproses": return "bg-warning";
      case "Siap Diambil": return "bg-success";
      case "Selesai": return "bg-success";
    }
  };

  const changeOrderStatus = async (id: string, newStatus: Tab) => {
    // Optimistic Update: Langsung ubah di UI agar terasa instan
    setOrders((prev: any) => 
      (prev || []).map((o: any) => o.id === id ? { ...o, status: newStatus } : o)
    );
    
    try {
      await api.updateOrderStatus(id, newStatus);
    } catch (e) {
      console.error(e);
      // Revert jika gagal
      mutateOrders(); 
      alert("Gagal memperbarui status pesanan. Pastikan internet Anda stabil.");
    }
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col">
      {/* 60-Second Notification Toast Component */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl bg-danger text-white font-bold text-sm flex items-center gap-4 animate-in slide-in-from-top-10 fade-in duration-300 max-w-sm w-[90%]">
          <Bell className="animate-bounce" size={24} />
          <span className="flex-1">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex w-full bg-brand rounded-t-2xl overflow-hidden shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${
              activeTab === tab 
                ? "bg-brand text-white" 
                : "bg-brand-hover text-white/70 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Active Tab Indicator (Underline style on the selected block) */}
      <div className="w-full flex h-1 bg-brand-hover">
        <div 
          className="h-full bg-surface transition-all duration-300"
          style={{ 
            width: `${100 / tabs.length}%`,
            transform: `translateX(${tabs.indexOf(activeTab) * 100}%)`
          }}
        />
      </div>

      <div className="bg-background border-x border-b border-sidebar-border rounded-b-2xl p-4 lg:p-6 flex-1 space-y-6">
        
        {/* Date Selector */}
        <div className="flex items-center justify-between text-brand border-b border-sidebar-border pb-4">
          <div className="flex items-center gap-2 font-bold">
            <Calendar size={20} />
            <span>Sen, 31 Mei 2026</span>
          </div>
          <button className="flex items-center gap-1 text-sm font-semibold hover:bg-brand-hover/10 px-2 py-1 rounded-lg transition-colors">
            Ganti Tanggal <ChevronDown size={16} />
          </button>
        </div>

        {/* Order Cards */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <OrderSkeleton />
              <OrderSkeleton />
              <OrderSkeleton />
            </>
          ) : currentOrders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-sidebar-border rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-text-muted opacity-50" />
              </div>
              <p className="text-text-muted font-medium">Tidak ada pesanan {activeTab.toLowerCase()}</p>
            </div>
          ) : (
            currentOrders.map((order: any) => (
              <div key={order.id} className="bg-surface rounded-2xl p-5 shadow-sm border border-sidebar-border relative overflow-hidden group hover:shadow-md transition-shadow">
                {/* Accent line on left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusDot(order.status as Tab)}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-xl text-text-primary tracking-tight">{order.id}</h3>
                    <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1 font-medium">
                      <span>{order.buyer_name || order.buyerName || 'Pelanggan'}</span> • <span>{new Date(order.created_at || order.date || new Date()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 bg-background rounded-lg font-bold text-sm border border-sidebar-border ${getStatusColor(order.status as Tab)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-1 mb-4">
                  <ul className="text-sm text-text-secondary">
                    {order.items?.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-text-primary">{item.name} <span className="font-normal text-text-muted">x{item.qty}</span></p>
                          {item.notes && <p className="text-xs italic text-text-muted mt-0.5">Catatan Item: {item.notes}</p>}
                        </div>
                        <span className="font-semibold text-text-primary">
                          Rp {(item.priceAtTime || 0).toLocaleString('id-ID')}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <div className="mt-3 p-3 bg-surface-hover rounded-xl border border-sidebar-border">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Catatan Tambahan Pesanan</p>
                      <p className="text-sm text-text-primary">{order.notes}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-sidebar-border pt-4 mb-5 flex items-center justify-between">
                  <span className="text-sm font-bold text-text-muted">Total Pembayaran</span>
                  <span className="font-black text-lg text-primary">Rp {(order.total_amount || order.total || 0).toLocaleString("id-ID")}</span>
                </div>

                <div className="flex items-center gap-3 mt-auto">
                  {order.status === "Baru" && (
                    <>
                      <button 
                        className="flex-1 py-2.5 rounded-xl border-2 border-text-primary text-text-primary font-bold hover:bg-text-primary hover:text-white transition-colors"
                        onClick={() => alert("Pesanan Ditolak")}
                      >
                        Tolak
                      </button>
                      <button 
                        className="flex-1 py-2.5 rounded-xl bg-text-primary text-white font-bold hover:bg-text-primary/90 transition-colors"
                        onClick={() => changeOrderStatus(order.id, "Diproses")}
                      >
                        Terima
                      </button>
                    </>
                  )}
                  {order.status === "Diproses" && (
                    <button 
                      className="w-full py-2.5 rounded-xl bg-text-primary text-white font-bold hover:bg-text-primary/90 transition-colors"
                      onClick={() => changeOrderStatus(order.id, "Siap Diambil")}
                    >
                      Selesai
                    </button>
                  )}
                  {order.status === "Siap Diambil" && (
                    <button 
                      className="w-full py-2.5 rounded-xl bg-text-primary text-white font-bold hover:bg-text-primary/90 transition-colors"
                      onClick={() => changeOrderStatus(order.id, "Selesai")}
                    >
                      Pesanan Diambil
                    </button>
                  )}
                  {order.status === "Selesai" && (
                    <div className="w-full text-right text-xs font-semibold text-text-muted">
                      {order.timeLabel || "Selesai"}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
