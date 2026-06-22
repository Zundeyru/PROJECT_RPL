"use client";

import React from 'react';
import Link from 'next/link';
import { Store } from '@/lib/mockData';
import { ChevronRight, MapPin } from 'lucide-react';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/store/${store.id}`}>
      <div className={`bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover border border-border-subtle flex items-center justify-between transition-all duration-300 hover:-translate-y-1 active:scale-95 group ${!store.isOpen ? 'opacity-70 grayscale' : ''}`}>
        <div className="flex items-center gap-4 relative">
          <div className="w-14 h-14 rounded-xl bg-primary-light/30 flex items-center justify-center text-primary font-bold text-xl overflow-hidden shadow-inner">
            {store.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary group-hover:text-primary transition-colors flex items-center gap-2">
              {store.name}
              {!store.isOpen && (
                <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">TUTUP</span>
              )}
            </h3>
            <div className="flex items-center gap-1 text-text-muted mt-1">
              <MapPin size={12} />
              <p className="text-xs font-medium">{store.location}</p>
            </div>
          </div>
        </div>
        <div className="text-text-muted group-hover:text-primary transition-colors group-hover:translate-x-1 transform duration-300">
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  );
}
