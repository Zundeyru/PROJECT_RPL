"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { totalItems, isHydrated } = useCart();
  const [userName, setUserName] = useState("Pembeli!");
  const [avatarUrl, setAvatarUrl] = useState("https://ui-avatars.com/api/?name=Pembeli&background=D2B48C&color=3E2723");

  useEffect(() => {
    const activeUser = localStorage.getItem("umm_active_user");
    if (activeUser) {
      try {
        const user = JSON.parse(activeUser);
        if (user.name) {
          setUserName(user.name);
          setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=D2B48C&color=3E2723`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <>
      <header className="bg-primary text-white p-4 pb-6 rounded-b-3xl shadow-card relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => window.dispatchEvent(new CustomEvent('openSidebar'))} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <div>
              <p className="text-sm font-medium text-white/80">Selamat Datang,</p>
              <p className="text-lg font-bold">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/cart" id="global-cart-icon-mobile" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
              <ShoppingCart size={24} />
              {isHydrated && totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="w-10 h-10 rounded-full bg-primary-light border-2 border-white/20 overflow-hidden shadow-sm">
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Link href="/search" className="block transform transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95">
          <div className="bg-white/10 hover:bg-white/20 transition-colors rounded-2xl flex items-center px-4 py-3 cursor-text shadow-sm">
            <Search size={20} className="text-white/70 mr-3" />
            <span className="text-white/70 text-sm">Mau makan apa hari ini?</span>
          </div>
        </Link>
      </header>
    </>
  );
}
