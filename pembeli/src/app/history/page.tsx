"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { Clock, CheckCircle2, ArrowRight, Loader2, PackageOpen, Menu } from 'lucide-react';
import { useBuyerOrders } from '@/hooks/useApi';

export default function HistoryPage() {
  const router = useRouter();
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("umm_active_user");
    if (userStr) {
      try { setActiveUser(JSON.parse(userStr)); } catch {}
    }
  }, []);

  const { orders, isLoading } = useBuyerOrders(activeUser?.id);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Baru': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Diproses': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Siap Diambil': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Selesai': return 'bg-green-100 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  const groupedOrders = React.useMemo(() => {
    if (!orders) return [];
    const map = new Map<string, any>();

    orders.forEach((order: any) => {
      // Extract baseId assuming format: ORD-timestamp-random-storeId
      const parts = order.id.split('-');
      const baseId = parts.length >= 3 ? parts.slice(0, 3).join('-') : order.id;
      
      if (!map.has(baseId)) {
        map.set(baseId, {
          baseId: baseId,
          date: order.created_at || order.date,
          status: order.status,
          totalAmount: 0,
          tenants: []
        });
      }

      const group = map.get(baseId);
      group.totalAmount += (order.total_amount || order.totalAmount || 0);
      group.tenants.push({
        storeName: order.store_name || order.storeName,
        items: order.items || []
      });
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders]);

  return (
    <div className="min-h-full flex flex-col bg-background animate-fade-in pb-24">
      <header className="lg:hidden bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button onClick={() => window.dispatchEvent(new CustomEvent('openSidebar'))} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="font-bold text-lg">Riwayat Pesanan</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-muted">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="font-bold">Memuat pesanan...</p>
          </div>
        ) : groupedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text-muted">
            <PackageOpen size={48} className="mb-4 opacity-50" />
            <p className="font-bold text-lg">Belum ada pesanan</p>
            <p className="text-sm mt-1">Ayo pesan makanan favoritmu sekarang!</p>
          </div>
        ) : (
          groupedOrders.map((group, idx) => (
            <div 
              key={group.baseId} 
              onClick={() => router.push(`/pesanan/${group.baseId}`)}
              className="bg-white rounded-2xl p-4 shadow-card border border-border-subtle cursor-pointer hover:border-primary transition-colors group"
            >
              <div className="flex justify-between items-start mb-3 border-b border-border-subtle pb-3">
                <p className="text-xs font-bold text-text-muted">{formatDate(group.date)}</p>
                <div className={`px-3 py-1 rounded-full border text-[10px] font-bold ${getStatusColor(group.status)}`}>
                  {group.status}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="space-y-3">
                  {group.tenants.map((tenant: any, tIdx: number) => (
                    <div key={tIdx}>
                      <h3 className="font-bold text-sm text-text-primary">{tenant.storeName}</h3>
                      <div className="mt-1 space-y-1">
                        {tenant.items.map((item: any, i: number) => (
                          <p key={i} className="text-xs text-text-muted">
                            {item.qty}x {item.name} {item.notes && <span className="italic">({item.notes})</span>}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-end mt-2 pt-3 border-t border-border-subtle border-dashed">
                  <div className="text-left">
                    <p className="text-[10px] text-text-muted font-bold">Total Pembayaran</p>
                    <p className="font-bold text-primary text-sm mt-0.5">Rp. {group.totalAmount.toLocaleString('id-ID')}</p>
                  </div>
                  <button className="bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full hover:bg-primary-hover shadow-sm flex items-center gap-1">
                    Detail <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
