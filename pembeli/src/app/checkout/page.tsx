"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, CheckCircle2, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { api } from '@/services/api';

type PaymentMethod = 'Cash' | 'Bank BCA' | 'Bank BNI' | 'Bank Mandiri' | 'QRIS';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, updateNotes, clearSelectedItems } = useCart();

  const [serviceMethod, setServiceMethod] = useState<'Makan di Tempat' | 'Take Away'>('Makan di Tempat');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [activeUser, setActiveUser] = useState<any>(null);

  // Per-store additional notes (order-level catatan, separate from per-item notes)
  const [storeNotes, setStoreNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getStores()
      .then(data => setStores(data))
      .catch(err => console.error(err));

    const userStr = localStorage.getItem("umm_active_user");
    if (userStr) {
      try { setActiveUser(JSON.parse(userStr)); } catch {}
    }
  }, []);

  // Wait for cart to hydrate before checking selected items
  if (!isHydrated) {
    return (
      <div className="min-h-full flex flex-col bg-surface items-center justify-center gap-4 opacity-60">
        <Loader2 size={48} className="text-primary animate-spin" />
        <p className="text-sm text-text-muted font-medium">Memuat checkout...</p>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="min-h-full flex flex-col bg-surface items-center justify-center gap-4">
        <Loader2 size={48} className="text-primary animate-spin" />
        <p className="text-sm text-text-muted font-bold animate-pulse">Mengalihkan ke pesanan Anda...</p>
      </div>
    );
  }

  const selectedItems = items.filter(item => item.selected);

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-full flex flex-col bg-surface p-6 items-center justify-center text-center">
        <AlertTriangle size={48} className="text-primary mb-4 opacity-50" />
        <p className="text-lg font-bold text-text-primary mb-4">Tidak ada item yang dipilih untuk checkout.</p>
        <button onClick={() => router.back()} className="bg-primary text-white px-6 py-3 rounded-xl font-bold">Kembali</button>
      </div>
    );
  }

  const itemsByStore = selectedItems.reduce((acc, item) => {
    const storeId = item.product.storeId;
    if (!acc[storeId]) acc[storeId] = [];
    acc[storeId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastMsg({ type, msg });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handlePay = async () => {
    if (!paymentMethod) {
      showToast('error', "Pilih metode pembayaran terlebih dahulu!");
      return;
    }

    setIsProcessing(true);
    try {
      // CRITICAL: Re-validate prices from DB before finalizing
      const cartItemsToValidate = selectedItems.map(i => ({ menuId: i.product.id, qty: i.quantity }));
      const validatedItems = await api.validateCartPrices(cartItemsToValidate);

      // Check if any item is no longer available
      const unavailableItems = validatedItems.filter((v: any) => !v.isAvailable);
      if (unavailableItems.length > 0) {
        showToast('error', `${unavailableItems.map((i: any) => i.name).join(', ')} sudah tidak tersedia!`);
        setIsProcessing(false);
        return;
      }

      // Generate ONE unified order ID for the entire checkout session
      const baseId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create an order for each store — include both per-item notes and store-level notes
      const orderPromises = Object.keys(itemsByStore).map(storeId => {
        const storeItems = itemsByStore[storeId];
        const storeValidatedItems = validatedItems.filter((v: any) =>
          storeItems.some((ci: any) => ci.product.id === v.menuId)
        );
        const storeTotal = storeValidatedItems.reduce((sum: number, v: any) => sum + (v.priceAtTime * v.qty), 0);
        const store = stores.find(s => s.id === storeId);
        const orderNote = storeNotes[storeId] || "";

        return api.createOrder({
          id: `${baseId}-${storeId}`, // Unique ID for Supabase, grouped by baseId
          buyerId: activeUser?.id || "unknown",
          buyerName: activeUser?.name || "Pelanggan",
          storeId: storeId,
          storeName: store?.name || storeId,
          items: storeValidatedItems.map((v: any) => {
            const originalItem = storeItems.find((ci: any) => ci.product.id === v.menuId);
            return {
              menuId: v.menuId,
              name: v.name,
              qty: v.qty,
              priceAtTime: v.priceAtTime,
              notes: originalItem?.notes || ""
            };
          }),
          notes: orderNote,          // order-level notes column
          totalAmount: storeTotal,
          status: "Baru",
          serviceMethod,
          paymentMethod,
          date: new Date().toISOString()
        });
      });

      const createdOrders = await Promise.all(orderPromises);

      // Trigger Web Push Notification API for all created orders
      for (const order of createdOrders) {
        if (order && order.store_id) {
          fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storeId: order.store_id,
              title: "Pesanan Baru Masuk!",
              message: `Ada pesanan baru dari ${order.buyer_name} seharga Rp ${(order.total_amount || 0).toLocaleString('id-ID')}`
            })
          }).catch(err => console.error('Failed to send push notification', err));
        }
      }

      setIsSuccess(true);
      clearSelectedItems();
      showToast('success', "🎉 Pesanan berhasil dibuat!");
      
      if (paymentMethod === 'Cash') {
        router.push(`/pesanan/${baseId}`);
      } else {
        router.push(`/payment?order_id=${baseId}&total_price=${total}&method=${paymentMethod}`);
      }
    } catch (e: any) {
      console.error(e);
      showToast('error', e.message || "Terjadi kesalahan saat memproses pesanan.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-background animate-fade-in pb-28 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-xl text-white font-bold text-sm flex items-center gap-2 animate-fade-in max-w-sm w-[90%] ${toastMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toastMsg.msg}
        </div>
      )}

      <header className="lg:hidden bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Checkout</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle">
          <p className="text-sm text-text-muted font-bold uppercase tracking-wider mb-2">Informasi Pemesan</p>
          <p className="text-sm text-text-primary font-medium"><span className="font-bold">Nama:</span> {activeUser?.name || '-'}</p>
          {activeUser?.nim && <p className="text-sm text-text-primary font-medium"><span className="font-bold">NIM:</span> {activeUser.nim}</p>}
          {activeUser?.phone && <p className="text-sm text-text-primary font-medium"><span className="font-bold">No. Telp:</span> {activeUser.phone}</p>}
        </div>

        {/* Order Details per Store */}
        {Object.keys(itemsByStore).map(storeId => {
          const store = stores.find(s => s.id === storeId);
          const storeItems = itemsByStore[storeId];
          const storeSubtotal = storeItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

          return (
            <div key={storeId} className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle">
              <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-2">
                <h2 className="font-bold text-text-primary">{store?.name || storeId}</h2>
                <span className="text-xs font-bold text-text-muted">#{storeId.toUpperCase()}</span>
              </div>

              <div className="space-y-4 mb-4">
                {storeItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-sidebar">
                      {item.product.image && (
                        <img src={item.product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-sm text-text-primary">{item.product.name}</h3>
                      <p className="text-xs text-text-muted">{item.quantity} Porsi</p>
                      <p className="font-bold text-primary text-sm mt-1">Rp. {item.product.price.toLocaleString('id-ID')}</p>

                      {/* Per-item notes — editable inline on checkout */}
                      <input
                        type="text"
                        value={item.notes}
                        onChange={e => updateNotes(item.id, e.target.value)}
                        placeholder="Catatan untuk item ini (opsional)..."
                        className="mt-1.5 text-xs text-text-muted bg-background/60 border border-border-subtle rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary focus:bg-white transition-all w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Store-level order notes (Catatan Pesanan) */}
              <div className="border-t border-border-subtle pt-3 mt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                  <FileText size={13} className="text-primary" />
                  Catatan Pesanan (untuk penjual)
                </label>
                <textarea
                  rows={2}
                  value={storeNotes[storeId] || ""}
                  onChange={e => setStoreNotes(prev => ({ ...prev, [storeId]: e.target.value }))}
                  placeholder={`Cth: "Tidak pedas", "Sambal dipisah", "Meja No. 5"...`}
                  className="w-full text-sm text-text-primary bg-background/60 border border-border-subtle rounded-xl px-3 py-2 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="border-t border-border-subtle pt-3 space-y-1 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-medium">Subtotal</span>
                  <span className="font-bold text-text-primary">Rp. {storeSubtotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Service Method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle">
          <h2 className="font-bold text-text-primary mb-3">Metode Pelayanan</h2>
          <div className="space-y-3">
            {(['Makan di Tempat', 'Take Away'] as const).map(method => (
              <button key={method} onClick={() => setServiceMethod(method)} className="w-full flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${serviceMethod === method ? 'border-primary' : 'border-text-muted'}`}>
                  {serviceMethod === method && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <span className="text-sm font-medium text-text-primary">{method}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method Selector */}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-border-subtle flex items-center justify-between group hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light/20 flex items-center justify-center text-primary">
              <span className="font-bold text-sm">Rp</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Metode Pembayaran</p>
              <p className={`font-bold text-sm ${paymentMethod ? 'text-primary' : 'text-text-muted'}`}>{paymentMethod || 'Pilih Metode'}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-text-muted group-hover:text-primary transition-colors" />
        </button>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted font-medium">Subtotal</span>
            <span className="font-bold text-text-primary">Rp. {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted font-medium">Pajak Kampus (11%)</span>
            <span className="font-bold text-text-primary">Rp. {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 mt-2 border-t border-dashed border-border-subtle">
            <span className="font-bold text-text-primary">Total Pembayaran</span>
            <span className="font-bold text-primary text-base">Rp. {total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Bar */}
      <div className="fixed lg:static bottom-0 left-0 right-0 bg-primary shadow-[0_-10px_30px_rgba(139,69,19,0.2)] p-4 rounded-t-3xl z-20">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="text-left">
            <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider">Total Pembayaran</p>
            <p className="text-white font-bold text-xl">Rp. {total.toLocaleString('id-ID')}</p>
          </div>
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="bg-white text-primary font-bold px-8 py-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
          >
            {isProcessing ? <><Loader2 size={16} className="animate-spin" /> Memproses...</> : 'Bayar Sekarang'}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setShowPaymentModal(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-3xl p-6 z-50 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-text-primary">Metode Pembayaran</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-text-muted hover:text-primary transition-colors font-medium">Tutup</button>
            </div>
            <div className="space-y-3 mb-6">
              {(['Cash', 'Bank BCA', 'Bank BNI', 'Bank Mandiri', 'QRIS'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => { setPaymentMethod(method); setShowPaymentModal(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${paymentMethod === method ? 'border-primary bg-primary-light/10 shadow-sm' : 'border-border-subtle bg-white hover:border-primary/50'}`}
                >
                  <span className={`font-bold text-sm ${paymentMethod === method ? 'text-primary' : 'text-text-primary'}`}>{method}</span>
                  {paymentMethod === method && <CheckCircle2 size={20} className="text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
