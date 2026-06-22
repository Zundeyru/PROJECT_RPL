"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, Coffee } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useStores, useMenus } from '@/hooks/useApi';
import { ProductSkeleton } from '@/components/Skeletons';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { stores } = useStores();
  const { menus: products, isLoading } = useMenus();

  const searchResults = query.trim() === "" 
    ? [] 
    : products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  // Group by store
  const resultsByStore = searchResults.reduce((acc, product) => {
    if (!acc[product.storeId]) {
      acc[product.storeId] = [];
    }
    acc[product.storeId].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-full flex flex-col bg-background animate-fade-in">
      <header className="lg:hidden bg-primary text-white p-4 pb-6 rounded-b-3xl shadow-card relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 bg-white flex items-center px-4 py-2 rounded-2xl shadow-inner">
            <input 
              type="text" 
              autoFocus
              placeholder="Cari makanan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-text-primary outline-none font-medium text-sm"
            />
            <SearchIcon size={20} className="text-primary ml-2" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        {query.trim() === "" ? (
          <div className="text-center pt-10 text-text-muted">
            <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>Mulai ketik untuk mencari makanan...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center pt-20 text-text-muted">
            <Coffee size={48} className="mx-auto mb-4 text-primary opacity-50" />
            <p className="font-bold text-lg text-text-primary mb-1">Pencarian Tidak Ditemukan</p>
            <p>Coba gunakan kata kunci lain</p>
          </div>
        ) : (
          <div className="space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            ) : (
              Object.keys(resultsByStore).map(storeId => {
                const store = (stores || []).find(s => s.id === storeId);
                const storeName = store?.name || "Kantin";
                const isStoreOpen = store ? store.isOpen : false;
                
                return (
                  <div key={storeId} className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle">
                    <h3 className="font-bold text-text-primary mb-4 pb-2 border-b border-border-subtle flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      {storeName}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {resultsByStore[storeId].map((product: any) => (
                        <ProductCard key={product.id} product={product} storeIsOpen={isStoreOpen} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Hide Scrollbar Style */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
