"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Store, Receipt, Package, MapPin, Loader2, CheckCircle, ChevronRight, Copy, CreditCard, Clock } from 'lucide-react';
import { api } from '@/services/api';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const baseOrderId = params.id as string; // This is now the base ID (e.g. ORD-171890000)
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!baseOrderId) return;
    
    const fetchOrder = async () => {
      try {
        const userStr = localStorage.getItem("umm_active_user");
        if (!userStr) {
          router.push('/');
          return;
        }
        const user = JSON.parse(userStr);
        const orders = await api.getOrdersByBuyer(user.id);
        
        // Find all orders that share this base checkout ID
        const foundOrders = orders.filter((o: any) => o.id.startsWith(baseOrderId));
        
        if (foundOrders.length > 0) {
          const baseOrder = foundOrders[0];
          
          // Combine them into a single Unified Receipt Object
          const combinedOrder = {
            id: baseOrderId,
            status: baseOrder.status, // Ideally, we should check if all are 'Selesai', but taking the first is okay for now
            created_at: baseOrder.created_at,
            service_method: baseOrder.service_method,
            payment_method: baseOrder.payment_method,
            notes: foundOrders.map((o: any) => o.notes).filter(Boolean).join(" | "),
            total_amount: foundOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
            tenants: foundOrders.map((o: any) => ({
              tenant_id: o.store_id,
              tenant_name: o.store_name,
              items: o.items || []
            }))
          };

          setOrder(combinedOrder);
        } else {
          setError("Pesanan tidak ditemukan.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Terjadi kesalahan saat mengambil data pesanan.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [baseOrderId, router]);

  const handleCopyId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-400 blur-xl opacity-20 rounded-full animate-pulse" />
          <Loader2 className="animate-spin text-orange-600 w-12 h-12 relative z-10" />
        </div>
        <p className="text-orange-900 font-medium mt-4 tracking-wide animate-pulse">Menyiapkan Pesananmu...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Package className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-slate-800 font-semibold mb-6">{error}</p>
        <button onClick={() => router.back()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Calculate Subtotal dynamically from all tenants
  let subtotal = 0;
  order.tenants.forEach((tenant: any) => {
    tenant.items.forEach((item: any) => {
      subtotal += (item.priceAtTime * item.qty);
    });
  });
  
  const storedTotal = order.total_amount || 0;
  const calculatedTax = storedTotal - subtotal;
  const shortId = order.id.split('-').pop();

  const getStatusConfig = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes('dimasak') || s.includes('proses')) {
      return { color: 'text-amber-700', bg: 'bg-amber-100/80', border: 'border-amber-200', icon: <Clock className="w-4 h-4 text-amber-600" /> };
    }
    if (s.includes('siap') || s.includes('diambil')) {
      return { color: 'text-blue-700', bg: 'bg-blue-100/80', border: 'border-blue-200', icon: <Package className="w-4 h-4 text-blue-600" /> };
    }
    if (s.includes('selesai')) {
      return { color: 'text-emerald-700', bg: 'bg-emerald-100/80', border: 'border-emerald-200', icon: <CheckCircle className="w-4 h-4 text-emerald-600" /> };
    }
    return { color: 'text-slate-700', bg: 'bg-slate-200/80', border: 'border-slate-300', icon: <Clock className="w-4 h-4 text-slate-500" /> };
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-12 font-sans selection:bg-orange-200 relative">
      
      {/* Premium Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[300px] md:h-[400px] bg-gradient-to-br from-orange-500 via-rose-500 to-amber-600 z-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 md:w-96 md:h-96 bg-white/10 blur-3xl rounded-full" />
        <div className="absolute top-20 -left-10 w-40 h-40 md:w-80 md:h-80 bg-orange-300/20 blur-2xl rounded-full" />
      </div>

      <header className="relative z-10 p-5 md:px-12 md:py-8 flex items-center max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="p-2.5 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full transition-all text-white border border-white/10 group flex items-center gap-2 pr-4">
          <ArrowLeft size={20} />
          <span className="hidden md:block font-medium text-sm">Kembali</span>
        </button>
        <h1 className="font-semibold text-lg md:text-2xl flex-1 text-center pr-10 md:pr-[100px] text-white tracking-wide">E-Receipt</h1>
      </header>

      <main className="relative z-10 px-4 md:px-8 max-w-md md:max-w-5xl mx-auto animate-fade-in-up mt-2 md:mt-8">
        
        {/* Grid Layout on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 md:gap-8 items-start">
          
          {/* LEFT COLUMN: Receipt Details & Tenants */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-1 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white">
            <div className="bg-white rounded-[28px] md:rounded-[36px] p-6 pb-8 md:p-8">
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-slate-800">Detail Pesanan</h2>
              </div>

              {/* Order Meta */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center group cursor-pointer" onClick={handleCopyId}>
                  <span className="text-slate-500 font-medium text-sm">No. Referensi</span>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg group-hover:bg-slate-100 transition-colors border border-slate-100">
                    <span className="text-slate-800 font-semibold text-sm">#{shortId}</span>
                    {isCopied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Tanggal</span>
                  <span className="text-slate-800 font-semibold text-sm">
                    {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full border-t border-dashed border-slate-200 mb-8" />

              {/* DYNAMIC MULTI-TENANT BLOCKS */}
              <div className="space-y-6">
                {order.tenants.map((tenant: any, tIdx: number) => (
                  <div key={tIdx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 transition-all hover:border-orange-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-sm border border-orange-200">
                        <Store size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Tenant Penjual</p>
                        <p className="font-bold text-sm md:text-base text-slate-800">{tenant.tenant_name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      {tenant.items && tenant.items.map((item: any, idx: number) => (
                        <div key={idx} className="group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <p className="font-bold text-slate-800 text-sm md:text-base leading-tight group-hover:text-orange-600 transition-colors">
                                {item.name}
                              </p>
                              <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium bg-white px-2 py-0.5 inline-block rounded-md border border-slate-100">
                                {item.qty}x @ Rp {(item.priceAtTime).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <p className="font-bold text-slate-800 text-sm md:text-base whitespace-nowrap pt-0.5">
                              Rp {(item.priceAtTime * item.qty).toLocaleString('id-ID')}
                            </p>
                          </div>
                          
                          {item.notes && (
                            <div className="mt-2.5 pl-3 border-l-2 border-orange-200">
                              <p className="text-xs md:text-sm text-slate-500 italic leading-snug">
                                "{item.notes}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="bg-orange-50/50 p-4 md:p-5 rounded-2xl border border-orange-100/50 flex items-start gap-3 mt-6">
                   <Receipt className="w-5 h-5 md:w-6 md:h-6 text-orange-400 shrink-0 mt-0.5" />
                   <div>
                      <p className="text-xs md:text-sm font-bold text-orange-800/60 uppercase tracking-wider mb-1">Catatan Keseluruhan</p>
                      <p className="text-sm md:text-base font-medium text-orange-900 italic">"{order.notes}"</p>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Financials & Meta */}
          <div className="flex flex-col gap-6 md:sticky md:top-24">
            
            {/* Payment Summary Ticket */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-1 shadow-lg border border-white md:mt-0 mt-2">
              <div className="bg-slate-900 rounded-[28px] p-6 pb-8 md:p-8 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />

                <div className="flex justify-between items-start mb-6">
                  <p className="text-white/60 font-medium text-xs md:text-sm uppercase tracking-widest mb-1">Status</p>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.bg.replace('/80','/20')} ${statusConfig.border.replace('300','600')} ${statusConfig.color.replace('700','300')} shadow-sm transition-all duration-300`}>
                    {statusConfig.icon}
                    <span className="font-bold text-xs tracking-wide">{order.status || "Pesanan Baru"}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-white/70 text-sm md:text-base">
                    <span>Subtotal Makanan</span>
                    <span className="font-medium text-white">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-white/70 text-sm md:text-base">
                    <span>Pajak & Biaya (11%)</span>
                    <span className="font-medium text-white">Rp {calculatedTax.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute left-[-40px] w-6 h-6 bg-[#F8FAFC] md:bg-transparent rounded-full shadow-inner" />
                  <div className="w-full border-t border-dashed border-white/20" />
                  <div className="absolute right-[-40px] w-6 h-6 bg-[#F8FAFC] md:bg-transparent rounded-full shadow-inner" />
                </div>

                <div className="text-center">
                  <p className="text-white/60 font-medium text-xs md:text-sm uppercase tracking-widest mb-2">Total Pembayaran</p>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    Rp {storedTotal.toLocaleString('id-ID')}
                  </h2>
                </div>
              </div>
            </div>

            {/* Informational Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors text-blue-500 flex items-center justify-center mb-4">
                  <CreditCard size={18} />
                </div>
                <p className="text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Metode Bayar</p>
                <p className="font-bold text-slate-800 text-sm md:text-base">{order.payment_method || "-"}</p>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all group">
                <div className="w-10 h-10 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors text-emerald-500 flex items-center justify-center mb-4">
                  <MapPin size={18} />
                </div>
                <p className="text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Pelayanan</p>
                <p className="font-bold text-slate-800 text-sm md:text-base">{order.service_method || "-"}</p>
              </div>
            </div>

            {/* Desktop Action Button */}
            <div className="hidden md:block mt-2">
              <button onClick={() => router.push('/')} className="w-full bg-orange-600 text-white font-semibold py-4 rounded-2xl shadow-xl shadow-orange-600/20 active:scale-[0.98] hover:bg-orange-700 hover:shadow-orange-700/30 transition-all flex items-center justify-center gap-2 group">
                Kembali ke Beranda
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Sticky Bottom Action (Mobile Only) */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent z-20 pb-8 pt-12 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
           <button onClick={() => router.push('/')} className="w-full bg-slate-900 text-white font-semibold py-4 rounded-2xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
             Kembali ke Beranda
             <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
      
    </div>
  );
}
