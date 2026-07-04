"use client";

import React, { useMemo } from 'react';
import { ArrowLeft, Store, Plus, Utensils, Receipt, CheckCircle2, Package, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

// CRITICAL REQUIREMENT: Robust mock JSON object handling multi-tenant orders
const mockOrderData = {
  order_id: "029",
  status: "Sedang Dimasak",
  date: "30 May 2026, 10:10 WIB",
  service_method: "Take Away",
  payment_method: "Qris",
  campus_tax: 2000,
  tenants: [
    {
      tenant_id: "t1",
      tenant_name: "Nasi Padang Bu Jamilah",
      location: "GKB 3 Lantai 3",
      items: [
        { 
          item_id: "i1", 
          name: "Nasi Ayam Rendang", 
          qty: 1, 
          unit_price: 15000, 
          notes: "Banyakin bumbu rendangnya bu, minta pedas :)" 
        },
        { 
          item_id: "i2", 
          name: "Perkedel Kentang", 
          qty: 2, 
          unit_price: 3000, 
          notes: "Tolong digoreng agak garing ya" 
        }
      ]
    },
    {
      tenant_id: "t2",
      tenant_name: "Es Teh Kampus",
      location: "GKB 1 Lantai 1",
      items: [
        { 
          item_id: "i3", 
          name: "Es Teh Manis Jumbo", 
          qty: 2, 
          unit_price: 4000, 
          notes: "Es nya dikit aja biar ngga tawar" 
        }
      ]
    }
  ]
};

const mockRecommendations = [
  { id: 'r1', name: 'Nasi Kuning', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' },
  { id: 'r2', name: 'Ayam Penyet', image: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=500' },
  { id: 'r3', name: 'Sate Madura', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500' },
  { id: 'r4', name: 'Soto Ayam', image: 'https://images.unsplash.com/photo-1548943487-a2e4b43b5936?w=500' },
];

export default function OrderDetailPage() {
  const router = useRouter();

  // Dynamic calculations for the Unified Financial Summary
  const { subtotal, grandTotal } = useMemo(() => {
    let sub = 0;
    mockOrderData.tenants.forEach(tenant => {
      tenant.items.forEach(item => {
        sub += item.unit_price * item.qty;
      });
    });
    return {
      subtotal: sub,
      grandTotal: sub + mockOrderData.campus_tax
    };
  }, []);

  // Determine badge styling based on status
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('dimasak')) return 'bg-red-600 text-white shadow-red-600/30';
    if (s.includes('siap') || s.includes('diambil')) return 'bg-orange-500 text-white shadow-orange-500/30';
    if (s.includes('selesai')) return 'bg-green-600 text-white shadow-green-600/30';
    return 'bg-gray-500 text-white shadow-gray-500/30';
  };

  // Generate dynamic pickup info combining all tenant locations
  const pickupInstructions = mockOrderData.tenants.map(t => `"${t.tenant_name}" (${t.location})`).join(' dan ');

  return (
    <div className="min-h-screen bg-[#FFF9F2] pb-10 font-sans text-gray-800 relative">
      {/* 1. HEADER */}
      <header className="bg-[#8B4513] text-white p-4 flex items-center shadow-md sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg flex-1 text-center pr-10">Detail Pemesanan</h1>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6 animate-fade-in mt-2">
        
        {/* Main Digital Receipt Card */}
        <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-sm border border-orange-900/10 relative overflow-hidden">
          
          {/* Decorative receipt accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B4513] to-orange-400 opacity-80" />

          {/* ORDER META & STATUS */}
          <div className="mb-5 mt-2">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">Nomor Pesanan</p>
                <p className="font-black text-xl text-gray-900">#{mockOrderData.order_id}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold shadow-md tracking-wide uppercase ${getStatusBadge(mockOrderData.status)}`}>
                {mockOrderData.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">{mockOrderData.date}</p>
          </div>

          <div className="border-t border-dashed border-gray-300 mb-6" />

          {/* 2. DYNAMIC ITEM GROUPING (Multi-Tenant Core Layout) */}
          <div className="space-y-6">
            {mockOrderData.tenants.map((tenant) => (
              <div key={tenant.tenant_id} className="bg-orange-50/50 p-4 rounded-2xl border border-orange-900/10">
                {/* Store Section Header */}
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-orange-900/10">
                  <div className="w-8 h-8 rounded-full bg-[#8B4513]/10 flex items-center justify-center shrink-0">
                    <Store size={16} className="text-[#8B4513]" />
                  </div>
                  <p className="font-bold text-[14px] text-[#8B4513]">Tenant: {tenant.tenant_name}</p>
                </div>
                
                {/* Store Items List */}
                <div className="space-y-4">
                  {tenant.items.map(item => (
                    <div key={item.item_id}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-3">
                          <p className="font-bold text-gray-900 text-[14px] leading-tight">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 font-medium">
                            {item.qty}x @ Rp {(item.unit_price).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 text-[14px] whitespace-nowrap">
                          Rp {(item.unit_price * item.qty).toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      {/* Explicit Item Notes (Catatan) */}
                      {item.notes && (
                        <div className="mt-2 pl-3 border-l-2 border-gray-300">
                          <p className="text-[12px] text-gray-500 italic leading-snug">
                            "Catatan: {item.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 mt-6 mb-5" />

          {/* 3. UNIFIED FINANCIAL SUMMARY */}
          <div className="space-y-4">
            
            <div className="space-y-2.5 text-[14px]">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Biaya Layanan (Pajak Kampus)</span>
                <span>Rp {mockOrderData.campus_tax.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-[15px]">Total Harga</span>
                <span className="font-black text-[#8B4513] text-xl tracking-tight">Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />
            
            {/* 4. ORDER DETAILS SECTION */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100 mt-2">
              <div className="flex gap-3">
                <Package size={18} className="text-[#8B4513]/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Metode Pelayanan</p>
                  <p className="text-[13px] font-bold text-gray-900">{mockOrderData.service_method}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Receipt size={18} className="text-[#8B4513]/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Metode Pembayaran</p>
                  <p className="text-[13px] font-bold text-gray-900">{mockOrderData.payment_method}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin size={18} className="text-[#8B4513]/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Info Pengambilan</p>
                  <p className="text-[13px] font-medium text-gray-700 leading-snug">
                    Silahkan ambil di tenant berikut:<br/>
                    <span className="font-bold text-gray-900 block mt-1">{pickupInstructions}</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 5. ACTION BUTTONS & FOOTER */}
        <button className="w-full bg-[#8B4513] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#8B4513]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 text-base">
          <Utensils size={18} />
          Pesan Lagi
        </button>

        {/* Rekomendasi Menu Lainnya */}
        <div className="mt-8 pb-4">
          <h2 className="font-bold text-gray-900 mb-4 px-1 flex items-center gap-2 text-[15px]">
            <span className="w-1.5 h-4 bg-[#8B4513] rounded-full inline-block"></span>
            Rekomendasi Menu Lainnya
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
            {mockRecommendations.map(rec => (
              <div key={rec.id} className="snap-start flex-shrink-0 w-32 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex flex-col relative group cursor-pointer">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-2">
                  <img src={rec.image} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {/* Floating Action Button */}
                  <button className="absolute bottom-1 right-1 w-7 h-7 bg-[#8B4513] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform border-2 border-white">
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="pb-1 px-1">
                  <p className="text-gray-900 font-bold text-xs leading-tight line-clamp-2">
                    {rec.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
