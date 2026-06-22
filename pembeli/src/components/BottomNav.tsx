"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-subtle pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 lg:hidden rounded-t-3xl">
      <Link href="/" className={`flex flex-col items-center p-2 transition-colors ${pathname === '/' ? 'text-primary' : 'text-text-muted'}`}>
        <Home size={24} className={pathname === '/' ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-bold mt-1">Beranda</span>
      </Link>
      
      <Link href="/history" className={`flex flex-col items-center p-2 transition-colors ${pathname === '/history' ? 'text-primary' : 'text-text-muted'}`}>
        <ClipboardList size={24} className={pathname === '/history' ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-bold mt-1">Pesanan</span>
      </Link>
      
      <Link href="/profile" className={`flex flex-col items-center p-2 transition-colors ${pathname === '/profile' ? 'text-primary' : 'text-text-muted'}`}>
        <User size={24} className={pathname === '/profile' ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-bold mt-1">Profile</span>
      </Link>
    </nav>
  );
}
