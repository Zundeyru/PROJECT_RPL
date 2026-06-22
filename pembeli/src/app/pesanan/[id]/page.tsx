"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, FileText, CheckCircle2, ChevronRight, Package, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    
    // Kita panggil getOrdersByBuyer atau fungsi getOrderById
    // Tapi karena kita tidak punya getOrderById di API pembeli saat ini, kita filter dari getAllOrders atau tambahkan getOrderById.
    const fetchOrder = async () => {
      try {
        const userStr = localStorage.getItem("umm_active_user");
        if (!userStr) {
          router.push('/');
          return;
        }
        const user = JSON.parse(userStr);
        const orders = await api.getOrdersByBuyer(user.id);
        const found = orders.find(o => o.id === orderId);
        
        if (found) {
          setOrder(found);
        } else {
          // Fallback, mungkin pesanan belum tersinkronisasi atau orderId salah
          console.warn("Order not found");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-primary animate-spin mb-4" />
        <p className="text-text-muted font-medium font-poppins">Memuat Detail Pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Package size={64} className="text-text-muted opacity-50 mb-4" />
        <h2 className="text-2xl font-black text-text-primary mb-2 font-poppins">Pesanan Tidak Ditemukan</h2>
        <p className="text-text-muted mb-6">Pesanan dengan ID {orderId} tidak ditemukan atau Anda tidak memiliki akses.</p>
        <button onClick={() => router.push('/history')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors">
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  // Determine progress steps
  const steps = ["Baru", "Diproses", "Siap Diambil", "Selesai"];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="h-full bg-background font-poppins pb-20 lg:pb-0">
      {/* Mobile Header (Hidden on Desktop because AppLayout already has a universal desktop header) */}
      <header className="lg:hidden bg-primary text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-20">
        <button onClick={() => router.push('/history')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg ml-4">Detail Pesanan</h1>
      </header>

      {/* Main Container */}
      <main className="px-4 md:px-0 w-full mt-4 md:mt-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* LEFT COLUMN: Status & Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Card (Ghibli vibe: soft colors, rounded-2xl) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border-subtle relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-light to-primary" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-text-muted font-bold tracking-wider uppercase mb-1">ID Pesanan</p>
                <h2 className="text-xl font-black text-text-primary tracking-tight">{order.id}</h2>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-primary-light/20 text-primary font-bold rounded-lg text-sm border border-primary/20">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="relative flex justify-between items-center mt-8 mb-2">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-surface-hover rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-primary transition-all duration-1000 ease-out" 
                   style={{ width: `${(Math.max(currentStepIndex, 0) / (steps.length - 1)) * 100}%` }} 
                 />
              </div>
              
              {steps.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={step} className="relative flex flex-col items-center z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-500 bg-white ${isCompleted ? 'border-primary' : 'border-border-subtle'}`}>
                      {isCompleted && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className={`absolute top-8 text-[10px] md:text-xs font-bold text-center w-20 -ml-10 transition-colors ${isCurrent ? 'text-primary' : 'text-text-muted'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-border-subtle space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-light/20 flex items-center justify-center shrink-0">
                <MapPin size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-bold tracking-wider uppercase">Toko Penjual</p>
                <p className="text-lg font-bold text-text-primary mt-0.5">{order.store_name}</p>
                <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1 font-medium bg-surface-hover w-fit px-2.5 py-1 rounded-lg border border-border-subtle">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  {order.service_method}
                </p>
              </div>
            </div>
            
            <div className="w-full h-px bg-border-subtle" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-light/20 flex items-center justify-center shrink-0">
                <Clock size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-bold tracking-wider uppercase">Waktu Pemesanan</p>
                <p className="text-base font-bold text-text-primary mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-sm text-text-muted mt-0.5 font-medium">
                  Pukul {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border-subtle space-y-4">
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-text-muted font-medium">Metode Pembayaran</span>
              <span className="font-bold text-text-primary px-3 py-1 bg-surface-hover rounded-lg border border-border-subtle">{order.payment_method}</span>
            </div>
            <div className="w-full h-px bg-border-subtle my-2" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-text-muted text-base md:text-lg">Total Bayar</span>
              <span className="font-black text-2xl md:text-3xl text-primary tracking-tight">Rp {(order.total_amount || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Items */}
        <div className="lg:col-span-7 h-fit">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border-subtle sticky top-24">
            <h3 className="font-black text-xl md:text-2xl text-text-primary mb-6 flex items-center gap-3">
              <Package size={28} className="text-primary" />
              Rincian Pesanan
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start p-4 hover:bg-surface-hover rounded-2xl transition-colors border border-transparent hover:border-border-subtle">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-light/10 text-primary font-black px-3 py-1.5 rounded-xl border border-primary/20 md:text-lg shrink-0">
                      {item.qty}x
                    </div>
                    <div>
                      <p className="font-bold text-text-primary md:text-lg leading-tight">{item.name}</p>
                      {item.notes && <p className="text-sm text-text-muted mt-1.5 italic font-medium bg-white px-3 py-1.5 rounded-lg border border-border-subtle inline-block">" {item.notes} "</p>}
                    </div>
                  </div>
                  <p className="font-bold text-text-primary md:text-lg shrink-0">
                    Rp {(item.priceAtTime * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-8 p-5 bg-surface-hover rounded-2xl border border-border-subtle relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Catatan Tambahan Keseluruhan Pesanan</p>
                <p className="text-base text-text-primary font-medium">{order.notes}</p>
              </div>
            )}
            
            {/* Call to action for seller interaction */}
            {order.status !== 'Selesai' && (
              <div className="mt-8 pt-6 border-t border-border-subtle">
                <div className="bg-primary-light/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="text-primary animate-pulse" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Pesanan Sedang Dalam Proses</h4>
                    <p className="text-sm text-primary/80 mt-0.5">Mohon tunggu hingga penjual mengkonfirmasi pesanan Anda.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
