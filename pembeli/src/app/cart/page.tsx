"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Trash2, Minus, Plus, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { api } from '@/services/api';

export default function CartPage() {
  const router = useRouter();
  const { items, isHydrated, updateQuantity, updateNotes, toggleSelection, toggleStoreSelection, removeItem, clearCart, selectedTotal } = useCart();
  const [stores, setStores] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.getStores()
      .then(data => setStores(data))
      .catch(err => console.error(err));
  }, []);

  // Group by store
  const itemsByStore = items.reduce((acc, item) => {
    const storeId = item.product.storeId;
    if (!acc[storeId]) acc[storeId] = [];
    acc[storeId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const isAllSelected = items.length > 0 && items.every(item => item.selected);
  const totalPrice = selectedTotal;

  const toggleAll = () => {
    const targetState = !isAllSelected;
    // We can't toggle all easily with context methods unless we add a specific one, 
    // so we'll just toggle store by store
    Object.keys(itemsByStore).forEach(storeId => toggleStoreSelection(storeId, targetState));
  };

  return (
    <div className="min-h-full flex flex-col bg-surface animate-fade-in">
      <header className="lg:hidden bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Keranjang Saya</h1>
        <button onClick={clearCart} className="p-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
          Edit
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        {!isHydrated ? (
          <div className="flex flex-col items-center justify-center h-full mt-24 gap-4 opacity-50">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-sm text-text-muted font-medium">Memuat keranjang...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center mt-24 opacity-50 px-6">
            <ShoppingCart size={80} className="text-primary mb-6 stroke-1" />
            <p className="text-xl font-bold text-text-primary">Gak Mangan Ta?</p>
            <p className="text-sm text-text-muted mt-2">Keranjang belanjamu masih kosong.</p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {Object.keys(itemsByStore).map(storeId => {
              const store = stores.find(s => s.id === storeId);
              const storeItems = itemsByStore[storeId];
              const isStoreAllSelected = storeItems.every(i => i.selected);

              return (
                <div key={storeId} className="bg-white rounded-2xl p-4 shadow-card border border-border-subtle">
                  <div className="flex items-center gap-3 border-b border-border-subtle pb-3 mb-4">
                    <input 
                      type="checkbox" 
                      checked={isStoreAllSelected}
                      onChange={() => toggleStoreSelection(storeId, !isStoreAllSelected)}
                      className="w-5 h-5 rounded accent-primary border-border-subtle"
                    />
                    <h2 className="font-bold text-text-primary">{store?.name || 'Toko Tidak Dikenal'}</h2>
                  </div>

                  <div className="space-y-4">
                    {storeItems.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <input 
                          type="checkbox" 
                          checked={item.selected}
                          onChange={() => toggleSelection(item.id)}
                          className="w-5 h-5 rounded accent-primary mt-2 border-border-subtle shrink-0"
                        />
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-sidebar">
                          <img src={item.product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-sm text-text-primary">{item.product.name}</h3>
                              <input 
                                type="text" 
                                value={item.notes} 
                                onChange={(e) => updateNotes(item.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Tambah catatan (opsional)..."
                                className="text-[10px] text-text-muted bg-transparent border-b border-border-subtle focus:border-primary focus:outline-none w-full mt-0.5 py-0.5 transition-colors"
                              />
                            </div>
                            <button onClick={() => removeItem(item.id)} className="p-1 text-text-muted hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="font-bold text-primary text-sm">Rp. {item.product.price.toLocaleString('id-ID')}</p>
                            <div className="flex items-center gap-3 bg-background rounded-full px-2 py-1 border border-border-subtle">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-text-muted hover:text-primary transition-colors">
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-text-muted hover:text-primary transition-colors">
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary shadow-[0_-10px_30px_rgba(139,69,19,0.2)] p-4 rounded-t-3xl z-30">
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={toggleAll}
                className="w-5 h-5 rounded accent-white border-white/40"
              />
              <span className="text-white text-sm font-bold">Semua</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider">Total Harga</p>
                <p className="text-white font-bold text-lg">Rp. {totalPrice.toLocaleString('id-ID')}</p>
              </div>
              <Link 
                href={totalPrice > 0 ? "/checkout" : "#"} 
                className={`bg-white text-primary font-bold px-6 py-3 rounded-xl transition-all duration-300 ${
                  totalPrice > 0 ? 'opacity-100 hover:scale-105 hover:-translate-y-1 active:scale-95 shadow-md' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                Check Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
