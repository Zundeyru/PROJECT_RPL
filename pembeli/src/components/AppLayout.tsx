"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Search, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Pembeli!");
  const pathname = usePathname();
  const { totalItems, isHydrated } = useCart();

  useEffect(() => {
    const activeUser = localStorage.getItem("umm_active_user");
    if (activeUser) {
      try {
        const user = JSON.parse(activeUser);
        if (user.nama) setUserName(user.nama);
      } catch (e) {
        console.error(e);
      }
    }

    const handleOpenSidebar = () => setIsSidebarOpen(true);
    window.addEventListener('openSidebar', handleOpenSidebar);
    return () => window.removeEventListener('openSidebar', handleOpenSidebar);
  }, []);

  const pageTitles: Record<string, string> = {
    "/": "Beranda",
    "/search": "Pencarian",
    "/cart": "Keranjang Saya",
    "/checkout": "Checkout",
    "/history": "Riwayat Pesanan",
    "/profile": "Profile",
  };

  const title = Object.entries(pageTitles)
    .filter(([p]) => pathname === p || (p !== "/" && pathname.startsWith(p)))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "E-Kantin UMM";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        
        {/* Desktop Header (Hidden on Mobile) */}
        <header className="hidden lg:flex bg-white border-b border-border-subtle px-8 py-5 items-center justify-between z-20 shadow-sm sticky top-0">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
            <p className="text-sm text-text-muted mt-0.5">Pesan makan tanpa antre!</p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/search" className="bg-surface-hover rounded-2xl flex items-center px-4 py-2.5 cursor-text hover:bg-border-subtle transition-colors w-64 border border-border-subtle group">
              <Search size={18} className="text-text-muted mr-3 group-hover:text-primary transition-colors" />
              <span className="text-text-muted text-sm font-medium group-hover:text-primary transition-colors">Cari makanan...</span>
            </Link>

            <Link href="/cart" className="relative p-2.5 rounded-xl bg-surface-hover text-primary hover:bg-primary hover:text-white transition-colors duration-200 group">
              <ShoppingCart size={22} className="stroke-[2.5]" />
              {isHydrated && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white group-hover:border-primary flex items-center justify-center text-[10px] text-white font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <div className="h-10 w-px bg-border-subtle" />
            
            <Link href="/profile" className="flex items-center gap-3 hover:bg-surface-hover p-2 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-border-subtle">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-text-primary leading-tight">{userName}</span>
                <span className="text-xs font-medium text-primary">Pembeli</span>
              </div>
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-primary-light overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=A05B2A&color=FFFFFF`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        {/* On mobile: bg is managed by individual pages (some use specific padding). 
            On desktop: we apply central max-width layout. */}
        <div className="flex-1 overflow-y-auto relative bg-background">
          <div className="lg:max-w-6xl lg:mx-auto lg:w-full lg:p-8 lg:min-h-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
