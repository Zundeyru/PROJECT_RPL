"use client";
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ProductCard from '@/components/ProductCard';
import StoreCard from '@/components/StoreCard';
import { ChevronRight, Flame, Heart } from 'lucide-react';
import { useStores, useMenus } from '@/hooks/useApi';
import { ProductSkeleton, StoreSkeleton } from '@/components/Skeletons';
import Link from 'next/link';
import { api } from '@/services/api';
import { useFavorites } from '@/hooks/useFavorites';

export default function Home() {
  const { stores, isLoading: isLoadingStores } = useStores();
  const { menus, isLoading: isLoadingMenus } = useMenus();
  const { favorites } = useFavorites();
  
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);

  // Effect for Rekomendasi (Top Selling)
  useEffect(() => {
    if (menus.length === 0) {
      setRecommendedProducts([]);
      return;
    }

    const fetchOrders = async () => {
      try {
        const orders = await api.getAllOrders();
        const salesCount: Record<string, number> = {};
        orders.forEach((o: any) => {
          if (o.items && Array.isArray(o.items)) {
            o.items.forEach((item: any) => {
              salesCount[item.menuId] = (salesCount[item.menuId] || 0) + item.qty;
            });
          }
        });

        const sortedMenus = [...menus].sort((a, b) => {
          const salesA = salesCount[a.id] || 0;
          const salesB = salesCount[b.id] || 0;
          return salesB - salesA;
        });

        setRecommendedProducts(sortedMenus.slice(0, 3));
      } catch (err) {
        console.error("Gagal mendapatkan pesanan", err);
        setRecommendedProducts(menus.slice(0, 3));
      }
    };
    fetchOrders();
  }, [menus]);

  // Effect for Menu Favorit
  useEffect(() => {
    if (menus.length === 0) {
      setFavoriteProducts([]);
      return;
    }
    const favs = menus.filter(m => favorites.includes(m.id));
    setFavoriteProducts(favs);
  }, [menus, favorites]);

  return (
    <>
      <div className="lg:hidden">
        <Header />
      </div>
      
      <main className="flex-1 pb-24 lg:pb-8 overflow-y-auto animate-fade-in">
        <div className="p-6 space-y-8">
          
          {/* Menu Rekomendasi */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Flame className="text-status-hot" size={20} /> Rekomendasi Menu
              </h2>
              <Link href="/search" className="text-primary bg-primary-light/20 p-1 rounded-full hover:bg-primary-light/40 transition-colors">
                <ChevronRight size={20} />
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
              {isLoadingMenus ? (
                <>
                  <ProductSkeleton />
                  <ProductSkeleton />
                  <ProductSkeleton />
                </>
              ) : (
                recommendedProducts.map((product: any) => (
                  <div key={product.id} className="snap-start shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Menu Favorit Mu */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Heart className="text-danger" size={20} fill="currentColor" /> Menu Favorit Mu
              </h2>
            </div>
            
            <div className={`flex ${favoriteProducts.length > 0 ? 'gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x' : 'justify-center py-6'}`}>
              {isLoadingMenus ? (
                <>
                  <ProductSkeleton />
                  <ProductSkeleton />
                </>
              ) : favoriteProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Heart size={32} className="opacity-50" />
                  <p className="text-sm font-medium">Belum ada menu favorit.</p>
                </div>
              ) : (
                favoriteProducts.map((product: any) => (
                  <div key={product.id} className="snap-start shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Daftar Toko */}
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-4">Daftar Toko</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingStores ? (
                <>
                  <StoreSkeleton />
                  <StoreSkeleton />
                  <StoreSkeleton />
                </>
              ) : (
                stores.map((store: any) => (
                  <StoreCard key={store.id} store={store} />
                ))
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Hide Scrollbar Style */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </>
  );
}
