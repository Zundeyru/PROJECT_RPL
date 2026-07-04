"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Store, Receipt, Package, MapPin, Loader2, CheckCircle, ChevronRight, Copy, CreditCard, Clock } from 'lucide-react';
import { api } from '@/services/api';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const baseOrderId = params.id as string;
  
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
        
        const foundOrders = orders.filter((o: any) => o.id.startsWith(baseOrderId));
        
        if (foundOrders.length > 0) {
          const baseOrder = foundOrders[0];
          const combinedOrder = {
            id: baseOrderId,
            status: baseOrder.status,
            created_at: baseOrder.created_at,
            service_method: baseOrder.service_method,
            payment_method: baseOrder.payment_method,
            total_amount: foundOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
            tenants: foundOrders.map((o: any) => ({
              tenant_id: o.store_id,
              tenant_name: o.store_name,
              items: o.items || [],
              tenant_note: o.notes || ""
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
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="animate-spin text-[#8B4513] w-12 h-12 relative z-10" />
        </div>
        <p className="text-[#8B4513] font-medium mt-4 tracking-wide animate-pulse">Menyiapkan Pesananmu...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Package className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-gray-800 font-semibold mb-6">{error}</p>
        <button onClick={() => router.back()} className="bg-[#8B4513] text-white px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-[#8B4513]/20 active:scale-95 transition-all">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

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
      return { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', icon: <Clock className="w-4 h-4 text-orange-600" /> };
    }
    if (s.includes('siap') || s.includes('diambil')) {
      return { color: 'text-[#8B4513]', bg: 'bg-[#8B4513]/10', border: 'border-[#8B4513]/20', icon: <Package className="w-4 h-4 text-[#8B4513]" /> };
    }
    if (s.includes('selesai')) {
      return { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', icon: <CheckCircle className="w-4 h-4 text-green-600" /> };
    }
    return { color: 'text-gray-700', bg: 'bg-gray-200', border: 'border-gray-300', icon: <Clock className="w-4 h-4 text-gray-500" /> };
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-[#FFF9F2] pb-24 md:pb-12 font-sans selection:bg-[#8B4513]/20 relative">
      
      {/* Background Dekstop Full (Top section block on Mobile, Full height on desktop for elegance) */}
      <div className="absolute top-0 left-0 right-0 h-[300px] md:h-[100vh] bg-[#8B4513] z-0 overflow-hidden md:fixed">
        {/* Subtle decorative curves matching Ghibli warmth */}
        <div className="absolute -top-20 -right-20 w-64 h-64 md:w-96 md:h-96 bg-[#A0522D]/40 blur-3xl rounded-full" />
        <div className="absolute top-40 -left-20 w-40 h-40 md:w-80 md:h-80 bg-[#D2691E]/20 blur-2xl rounded-full" />
      </div>

      <header className="relative z-10 p-5 md:px-12 md:py-8 flex items-center max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white border border-white/20 group flex items-center gap-2 pr-4 backdrop-blur-sm">
          <ArrowLeft size={20} />
          <span className="hidden md:block font-medium text-sm">Kembali</span>
        </button>
        <h1 className="font-bold text-lg md:text-2xl flex-1 text-center pr-10 md:pr-[100px] text-white tracking-wide">Detail Pemesanan</h1>
      </header>

      <main className="relative z-10 px-4 md:px-8 max-w-md md:max-w-6xl mx-auto animate-fade-in-up mt-2 md:mt-4">
        
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 md:gap-8 items-start">
          
          {/* LEFT COLUMN: Receipt Details & Tenants */}
          <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 pb-8 md:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-[#8B4513]/10 relative overflow-hidden">
            
            {/* Top decorative receipt line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#8B4513] opacity-80" />

            <div className="flex items-center gap-3 mb-6 mt-2">
              <div className="w-2 h-8 bg-[#8B4513] rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Daftar Menu</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center group cursor-pointer" onClick={handleCopyId}>
                <span className="text-gray-500 font-medium text-sm uppercase tracking-wider">No. Pesanan</span>
                <div className="flex items-center gap-2 bg-[#FFF9F2] px-3 py-1.5 rounded-lg group-hover:bg-[#FDEEDC] transition-colors border border-[#8B4513]/10">
                  <span className="text-gray-900 font-black text-sm">#{shortId}</span>
                  {isCopied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#8B4513] group-hover:text-[#A0522D]" />}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm uppercase tracking-wider">Tanggal Waktu</span>
                <span className="text-gray-800 font-bold text-sm">
                  {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                </span>
              </div>
            </div>

            <div className="w-full border-t border-dashed border-gray-300 mb-8" />

            <div className="space-y-6">
              {order.tenants.map((tenant: any, tIdx: number) => (
                <div key={tIdx} className="bg-[#FFF9F2] rounded-2xl p-5 border border-[#8B4513]/10 transition-all hover:border-[#8B4513]/30 hover:shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#8B4513]/10">
                    <div className="w-10 h-10 rounded-full bg-[#8B4513]/10 text-[#8B4513] flex items-center justify-center shrink-0 shadow-sm border border-[#8B4513]/20">
                      <Store size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Penjual</p>
                      <p className="font-bold text-sm md:text-base text-gray-900">{tenant.tenant_name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    {tenant.items && tenant.items.map((item: any, idx: number) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <p className="font-bold text-gray-900 text-sm md:text-base leading-tight group-hover:text-[#8B4513] transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs md:text-sm text-gray-600 mt-1 font-medium bg-white px-2 py-0.5 inline-block rounded-md border border-[#8B4513]/10">
                              {item.qty}x @ Rp {(item.priceAtTime).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900 text-sm md:text-base whitespace-nowrap pt-0.5">
                            Rp {(item.priceAtTime * item.qty).toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        {item.notes && (
                          <div className="mt-2.5 pl-3 border-l-2 border-[#8B4513]/30">
                            <p className="text-xs md:text-sm text-gray-600 italic leading-snug">
                              "Catatan: {item.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {tenant.tenant_note && (
                    <div className="mt-4 pt-4 border-t border-dashed border-[#8B4513]/20 flex items-start gap-2">
                       <Receipt className="w-4 h-4 text-[#8B4513] shrink-0 mt-0.5" />
                       <div>
                          <p className="text-[11px] md:text-xs font-bold text-[#8B4513]/70 uppercase tracking-wider mb-0.5">Catatan Untuk Penjual</p>
                          <p className="text-xs md:text-sm font-medium text-gray-800 italic">"{tenant.tenant_note}"</p>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Financials & Meta */}
          <div className="flex flex-col gap-6 md:sticky md:top-24">
            
            {/* Payment Summary Ticket */}
            <div className="bg-white rounded-[32px] p-1 shadow-lg border border-[#8B4513]/10 md:mt-0 mt-2">
              <div className="bg-gradient-to-br from-[#8B4513] to-[#5C2E0C] rounded-[28px] p-6 pb-8 md:p-8 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl" />

                <div className="flex justify-between items-start mb-6">
                  <p className="text-white/80 font-bold text-xs md:text-sm uppercase tracking-widest mb-1">Status Pesanan</p>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white text-gray-900 shadow-sm transition-all duration-300`}>
                    {statusConfig.icon}
                    <span className="font-black text-xs tracking-wide uppercase">{order.status || "Pesanan Baru"}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-white/90 font-medium text-sm md:text-base">
                    <span>Subtotal Makanan</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-white/90 font-medium text-sm md:text-base">
                    <span>Pajak Kampus (11%)</span>
                    <span>Rp {calculatedTax.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute left-[-40px] w-6 h-6 bg-[#FFF9F2] md:bg-[#8B4513] rounded-full shadow-inner" />
                  <div className="w-full border-t-2 border-dashed border-white/30" />
                  <div className="absolute right-[-40px] w-6 h-6 bg-[#FFF9F2] md:bg-[#8B4513] rounded-full shadow-inner" />
                </div>

                <div className="text-center">
                  <p className="text-white/80 font-bold text-xs md:text-sm uppercase tracking-widest mb-2">Total Harga</p>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    Rp {storedTotal.toLocaleString('id-ID')}
                  </h2>
                </div>
              </div>
            </div>

            {/* Informational Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-[#8B4513]/10 hover:shadow-md hover:border-[#8B4513]/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-[#8B4513]/10 group-hover:bg-[#8B4513]/20 transition-colors text-[#8B4513] flex items-center justify-center mb-4">
                  <CreditCard size={18} />
                </div>
                <p className="text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Metode Bayar</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">{order.payment_method || "-"}</p>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-[24px] shadow-sm border border-[#8B4513]/10 hover:shadow-md hover:border-[#8B4513]/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-[#8B4513]/10 group-hover:bg-[#8B4513]/20 transition-colors text-[#8B4513] flex items-center justify-center mb-4">
                  <MapPin size={18} />
                </div>
                <p className="text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Pelayanan</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">{order.service_method || "-"}</p>
              </div>
            </div>

            {/* Desktop Action Button */}
            <div className="hidden md:block mt-2">
              <button onClick={() => router.push('/')} className="w-full bg-white text-[#8B4513] font-bold border-2 border-[#8B4513] py-4 rounded-2xl shadow-xl shadow-[#8B4513]/10 active:scale-[0.98] hover:bg-[#FFF9F2] transition-all flex items-center justify-center gap-2 group">
                Kembali ke Beranda
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Sticky Bottom Action (Mobile Only) */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FFF9F2] via-[#FFF9F2] to-transparent z-20 pb-8 pt-12 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
           <button onClick={() => router.push('/')} className="w-full bg-[#8B4513] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#8B4513]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
             Kembali ke Beranda
             <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
      
    </div>
  );
}
