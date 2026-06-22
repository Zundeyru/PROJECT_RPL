"use client";

import React, { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { useCart, CartProduct } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';

interface ProductCardProps {
  product: any;
  storeIsOpen?: boolean;
}

export default function ProductCard({ product, storeIsOpen = true }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [animateCart, setAnimateCart] = useState(false);
  const router = useRouter();

  const productId = product.id || `${product.storeId}-${product.name.replace(/\s+/g, '-')}`;

  const isLiked = isFavorite(productId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.isAvailable || !storeIsOpen) return;

    const cartProduct: CartProduct = {
      id: productId,
      storeId: product.storeId,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    };
    addToCart(cartProduct, 1);
    
    // Tiny animation feedback
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 300);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(productId);
  };

  const handleCardClick = () => {
    router.push(`/product/${productId}`);
  };

  const isAvailable = product.isAvailable && storeIsOpen;

  return (
    <div 
      onClick={handleCardClick}
      className={`cursor-pointer bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover border border-border-subtle transition-all duration-300 hover:-translate-y-1 active:scale-95 flex flex-col gap-3 min-w-[160px] max-w-[200px] h-full ${!isAvailable ? 'opacity-70 grayscale' : ''}`}
    >
      <div className="relative w-full h-32 rounded-xl overflow-hidden group">
        <img src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-danger px-3 py-1 rounded-full">HABIS</span>
          </div>
        )}
        <button 
          onClick={handleLike}
          className="absolute top-2 right-2 p-1.5 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all active:scale-90"
        >
          <Heart size={16} fill={isLiked ? "#EF4444" : "transparent"} className={isLiked ? "text-red-500" : ""} />
        </button>
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-sm text-text-primary line-clamp-2 leading-tight">{product.name}</h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="font-extrabold text-sm text-primary">Rp. {(product.price || 0).toLocaleString('id-ID')}</p>
          <button 
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 
              ${isAvailable ? 'bg-primary text-white hover:bg-primary-hover hover:scale-110' : 'bg-sidebar-border text-text-muted cursor-not-allowed'}
              ${animateCart ? 'scale-125' : ''}`}
          >
            <Plus size={16} className="stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
