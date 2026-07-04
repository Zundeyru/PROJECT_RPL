"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Undo2, Heart, Plus } from 'lucide-react';
import { useCart, CartProduct } from '@/context/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useFlyToCart } from '@/context/FlyToCartContext';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { startFlyAnimation } = useFlyToCart();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animateCart, setAnimateCart] = useState(false);

  const isLiked = product ? isFavorite(product.id) : false;

  useEffect(() => {
    if (params.id) {
      api.getMenuById(params.id as string)
        .then(data => setProduct(data))
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3]">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5E6D3]">
        <p className="text-lg font-bold mb-4">Produk tidak ditemukan</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-primary text-white rounded-xl">Kembali</button>
      </div>
    );
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!product.isAvailable) return;
    
    const cartProduct: CartProduct = {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    };
    
    addToCart(cartProduct, 1);
    
    // Start fly to cart animation
    startFlyAnimation(e.clientX, e.clientY, product.image);
    
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 300);
  };

  return (
    <div className="min-h-screen bg-bg-body flex flex-col md:pt-10 md:pb-20">
      
      {/* Mobile-only Back Button (Absolute Top) */}
      <div className="md:hidden absolute top-6 left-4 z-20">
        <button 
          onClick={() => router.back()}
          className="bg-black/20 p-3 rounded-2xl text-white backdrop-blur-md transition-transform active:scale-90"
        >
          <Undo2 size={24} />
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto md:px-8 flex-1 flex flex-col md:flex-row gap-0 md:gap-16 lg:gap-24 md:items-center">
        
        {/* ================= LEFT / TOP : IMAGE ================= */}
        <div className="relative w-full h-[50vh] md:h-auto md:w-1/2 md:aspect-square md:rounded-[40px] overflow-hidden shadow-2xl md:shadow-card group shrink-0 bg-white">
          <img 
            src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105" 
          />
          
          {/* Overlay gradient for mobile to make back button visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent md:hidden" />

          {/* Desktop Back Button */}
          <button 
            onClick={() => router.back()}
            className="hidden md:flex absolute top-6 left-6 bg-white/80 hover:bg-white p-3 rounded-2xl text-text-primary backdrop-blur-md transition-all active:scale-90 shadow-md hover:shadow-lg"
          >
            <Undo2 size={24} strokeWidth={2.5} />
          </button>
          
          {/* Like Button */}
          <button 
            onClick={() => toggleFavorite(product.id)}
            className="absolute bottom-6 right-6 bg-white/90 hover:bg-white p-4 rounded-2xl text-text-primary backdrop-blur-md transition-all active:scale-90 shadow-lg hover:shadow-xl"
          >
            <Heart size={28} fill={isLiked ? "#EF4444" : "transparent"} strokeWidth={2.5} className={isLiked ? "text-danger" : ""} />
          </button>

          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-extrabold text-2xl tracking-widest bg-danger px-8 py-3 rounded-full shadow-2xl rotate-[-10deg] border-4 border-white/20">
                HABIS
              </span>
            </div>
          )}
        </div>

        {/* ================= RIGHT / BOTTOM : CONTENT ================= */}
        <div className="flex flex-col flex-1 w-full md:w-1/2 px-6 py-8 md:p-0 bg-white md:bg-transparent rounded-t-[40px] md:rounded-none -mt-8 md:mt-0 relative z-10 min-h-[55vh] md:min-h-0">
          
          {/* Price */}
          <div className="mb-2 md:mb-4">
            <p className="text-3xl md:text-5xl font-black text-primary tracking-tight">
              <span className="text-lg md:text-2xl font-bold mr-1 md:mr-2 text-primary/80">Rp</span>
              {(product.price || 0).toLocaleString('id-ID')}
            </p>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-5xl font-extrabold text-text-primary mb-4 md:mb-6 leading-tight">
            {product.name}
          </h1>
          
          {/* Divider */}
          <div className="w-16 h-1.5 bg-primary/30 rounded-full mb-6 md:mb-8 hidden md:block" />

          {/* Description */}
          <div className="flex-1">
            <h3 className="text-sm md:text-lg font-bold text-text-primary mb-2">Deskripsi Makanan</h3>
            <p className="text-sm md:text-lg text-text-secondary leading-relaxed mb-8 md:mb-10 max-w-xl">
              {product.description || `${product.name} yang nikmat dan menggugah selera. Dibuat dengan bahan-bahan pilihan berkualitas tinggi dengan cita rasa otentik yang pasti akan memanjakan lidah Anda. Cocok dinikmati kapan saja.`}
            </p>
          </div>

          {/* Add to Cart Actions */}
          <div className="mt-auto md:mt-8 flex items-center gap-4">
            {/* Desktop Add to Cart */}
            <button 
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className={`hidden md:flex flex-1 py-5 rounded-2xl items-center justify-center gap-3 text-white shadow-card transition-all duration-300 font-extrabold text-xl
                ${product.isAvailable ? 'bg-primary hover:bg-primary-hover hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.98]' : 'bg-sidebar-border text-text-muted cursor-not-allowed'}
                ${animateCart ? 'scale-105 shadow-xl bg-success' : ''}
              `}
            >
              <Plus size={26} strokeWidth={3} />
              {animateCart ? "Berhasil Ditambahkan!" : "Tambah ke Keranjang"}
            </button>

            {/* Mobile Add to Cart (Full width button at bottom) */}
            <button 
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className={`md:hidden w-full py-4 rounded-[20px] flex items-center justify-center gap-2 text-white shadow-lg transition-all duration-300 font-bold text-lg
                ${product.isAvailable ? 'bg-primary active:scale-95' : 'bg-gray-400 cursor-not-allowed'}
                ${animateCart ? 'scale-105 bg-success' : ''}
              `}
            >
              <Plus size={24} strokeWidth={3} />
              {animateCart ? "Ditambahkan!" : "Tambah"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
