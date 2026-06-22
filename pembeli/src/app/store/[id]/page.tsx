"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, ShoppingCart, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useStore, useMenus } from '@/hooks/useApi';
import { ProductSkeleton } from '@/components/Skeletons';

const categories = ["Semua", "Makanan", "Minuman", "Snack"];

export default function StoreDetail() {
  const router = useRouter();
  const { id } = useParams();
  const { totalItems, isHydrated } = useCart();
  
  const [activeCategory, setActiveCategory] = useState("Semua");
  
  const storeIdStr = Array.isArray(id) ? id[0] : (id || "");
  const { store, isLoading: isLoadingStore } = useStore(storeIdStr);
  const { menus: storeProducts, isLoading: isLoadingMenus } = useMenus(storeIdStr);
  
  const filteredProducts = activeCategory === "Semua" 
    ? storeProducts 
    : storeProducts.filter((p: any) => p.category === activeCategory);

  if (isLoadingStore) return <div className="p-8 text-center text-text-muted animate-pulse">Memuat Toko...</div>;
  if (!store) return <div className="p-8 text-center font-bold text-text-primary">Toko tidak ditemukan</div>;

  return (
    <div className="min-h-full flex flex-col bg-background animate-fade-in pb-20 md:pb-8">
      
      <div className="w-full max-w-7xl mx-auto px-0 md:px-6 w-full flex flex-col flex-1">
        {/* Banner & Header */}
        <div className="relative h-64 md:h-80 w-full shrink-0 md:mt-6 md:rounded-[2rem] overflow-hidden shadow-sm md:shadow-2xl border-0 md:border md:border-sidebar-border">
          <img 
            src={store.coverImage || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"} 
            alt={store.name} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Navigation - Visible on Mobile and Desktop */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <button onClick={() => router.back()} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors shadow-lg hover:scale-105">
              <ArrowLeft size={24} />
            </button>
            
            <Link href="/cart" className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors shadow-lg hover:scale-105 relative">
              <ShoppingCart size={24} />
              {isHydrated && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black/40">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div className="text-white">
              <h1 className="text-3xl md:text-5xl font-black mb-2 shadow-sm tracking-tight">{store.name}</h1>
              <p className="text-sm md:text-base font-medium text-white/90 flex items-center gap-1.5 bg-black/30 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                <MapPin size={16} /> {store.location}
              </p>
            </div>
            <div className={`text-sm md:text-base font-bold px-6 py-2.5 rounded-full shadow-lg self-start md:self-end ${store.isOpen ? 'bg-white text-primary border-2 border-white' : 'bg-danger text-white border-2 border-danger'}`}>
              {store.isOpen ? "Toko Buka" : "Toko Tutup"}
            </div>
          </div>
        </div>

        {!store.isOpen && (
          <div className="bg-danger/10 text-danger border border-danger/20 rounded-2xl p-4 text-center text-sm md:text-base font-bold shadow-sm mx-4 md:mx-0 mt-6">
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Toko ini sedang tutup. Anda tidak dapat memesan untuk saat ini.
            </span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="bg-background md:bg-transparent sticky top-0 md:top-6 z-20 mt-4 md:mt-8 md:mb-6">
          <div className="flex overflow-x-auto hide-scrollbar px-4 md:px-0 gap-2 md:gap-4 pb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 md:py-3 whitespace-nowrap text-sm md:text-base font-bold transition-all rounded-full border-2 ${
                  activeCategory === cat 
                    ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 scale-105' 
                    : 'border-border-subtle bg-surface text-text-muted hover:border-primary/30 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-0">
          {isLoadingMenus ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-3xl border border-sidebar-border mt-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={32} className="text-primary opacity-50" />
              </div>
              <p className="text-text-muted font-medium text-lg">Tidak ada menu di kategori ini.</p>
            </div>
          ) : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} storeIsOpen={store.isOpen} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
