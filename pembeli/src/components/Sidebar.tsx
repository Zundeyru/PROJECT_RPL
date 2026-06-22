"use client";

import React from 'react';
import Link from 'next/link';
import { Home, ClipboardList, User, LogOut, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const overlayClass = isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";
  const sidebarClass = isOpen ? "translate-x-0" : "-translate-x-full";

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("umm_active_user");
    const origin = localStorage.getItem("umm_login_origin");
    if (origin && !origin.startsWith("file://")) {
      window.location.href = origin;
    } else {
      alert("Logout Berhasil! Karena Anda membuka file index.html secara lokal, browser tidak mengizinkan kembali secara otomatis. Silakan tutup tab ini dan buka kembali file index.html.");
      window.location.href = "about:blank";
    }
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      <div 
        className={`fixed inset-0 bg-text-primary/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${overlayClass}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 h-[100dvh] w-[280px] bg-white border-r border-border-subtle z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none lg:static lg:translate-x-0 lg:flex ${sidebarClass}`}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
              <span className="font-bold text-xl">U</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-primary leading-tight">E-Kantin</h1>
              <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider">Pembeli</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-primary hover:bg-primary-light/10 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto hide-scrollbar">
          <Link 
            href="/" 
            onClick={onClose} 
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${
              pathname === '/' 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-primary hover:bg-primary/5 hover:text-primary'
            }`}
          >
            <Home size={22} className={pathname === '/' ? "text-white" : "text-primary"} />
            <span>Beranda</span>
          </Link>
          <Link 
            href="/history" 
            onClick={onClose} 
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${
              pathname.startsWith('/history') || pathname.startsWith('/pesanan') 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-primary hover:bg-primary/5 hover:text-primary'
            }`}
          >
            <ClipboardList size={22} className={pathname.startsWith('/history') || pathname.startsWith('/pesanan') ? "text-white" : "text-primary"} />
            <span>Pesanan Saya</span>
          </Link>
          <Link 
            href="/profile" 
            onClick={onClose} 
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${
              pathname.startsWith('/profile') 
                ? 'bg-primary text-white shadow-md' 
                : 'text-text-primary hover:bg-primary/5 hover:text-primary'
            }`}
          >
            <User size={22} className={pathname.startsWith('/profile') ? "text-white" : "text-primary"} />
            <span>Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border-subtle mt-auto pb-8 lg:pb-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-4 px-4 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md group">
            <LogOut size={22} className="stroke-[2.5] transition-transform group-hover:-translate-x-1" />
            LOGOUT
          </button>
        </div>
      </aside>
    </>
  );
}
