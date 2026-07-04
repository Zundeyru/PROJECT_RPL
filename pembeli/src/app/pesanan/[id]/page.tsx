"use client";

import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Robust mock JSON object handling multi-tenant orders
const mockOrder = {
  order_id: "029",
  status: "Sedang Dimasak",
  date: "30 May 2026 10:10",
  notes: "Banyakin sambelnya bu :)",
  service_method: "Take Away",
  payment_method: "Qris",
  campus_tax: 2000,
  hero_image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", 
  tenants: [
    {
      tenant_id: "t1",
      tenant_name: "Nasi Padang Bu Jamilah",
      pickup_location: "GKB 3 Lantai 3",
      items: [
        { item_id: "i1", name: "Nasi Ayam Rendang", qty: 1, price: 15000 }
      ]
    },
    {
      tenant_id: "t2",
      tenant_name: "Es Teh Kampus",
      pickup_location: "GKB 1 Lantai 1",
      items: [
        { item_id: "i2", name: "Es Teh Manis Jumbo", qty: 2, price: 8000 }
      ]
    }
  ]
};

const mockRecommendations = [
  { id: 'r1', name: 'Nasi Padang', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' },
  { id: 'r2', name: 'Nasi Padang', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' },
  { id: 'r3', name: 'Nasi Padang', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' },
];

export default function OrderDetailPage() {
  const router = useRouter();

  // Calculate Subtotal dynamically from grouped items
  const subtotal = mockOrder.tenants.reduce((acc, tenant) => {
    return acc + tenant.items.reduce((sum, item) => sum + item.price, 0);
  }, 0);
  
  const grandTotal = subtotal + mockOrder.campus_tax;

  // Determine badge color based on status
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'sedang dimasak': return 'bg-red-700 text-white';
      case 'selesai': return 'bg-green-600 text-white';
      case 'baru': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Generate dynamic pickup info based on tenants
  const pickupInfoText = mockOrder.tenants.map(t => `Tenant "${t.tenant_name}" ${t.pickup_location}`).join(' dan ');

  // Get all tenant names for the top meta block
  const allTenantNames = mockOrder.tenants.map(t => t.tenant_name).join(', ');

  return (
    <div className="min-h-screen bg-[#FFF9F2] pb-10 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-[#8B4513] text-white p-4 flex items-center shadow-md sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg flex-1 text-center pr-10">Detail Pemesanan</h1>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        
        {/* Receipt Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200">
          
          {/* Hero Image */}
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6">
            <img 
              src={mockOrder.hero_image} 
              alt="Hero Item" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="border-t-[1.5px] border-gray-300 mb-4" />

          {/* Meta & Status */}
          <div className="flex justify-between items-center mb-4">
            <p className="font-medium text-[15px] text-gray-900">Nomer Pemesanan #{mockOrder.order_id}</p>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${getStatusColor(mockOrder.status)}`}>
              {mockOrder.status}
            </span>
          </div>

          <div className="border-t-[1.5px] border-gray-300 mb-4" />

          {/* Date & Tenants Summary */}
          <div className="text-[14px] font-medium text-gray-800 mb-4 space-y-0.5">
            <p>Tanggal: {mockOrder.date}</p>
            <p>Tenant: {allTenantNames}</p>
          </div>

          <div className="border-t-[1.5px] border-gray-300 mb-4" />

          {/* Grouped Items List */}
          <div className="mb-4 space-y-4">
            {mockOrder.tenants.map((tenant) => (
              <div key={tenant.tenant_id}>
                <p className="font-bold text-[14px] mb-1.5 text-gray-900">Tenant: {tenant.tenant_name}</p>
                <div className="space-y-1.5">
                  {tenant.items.map(item => (
                    <div key={item.item_id} className="flex justify-between text-[14px] font-medium text-gray-800">
                      <span>{item.name} ({item.qty}x)</span>
                      <span>Rp. {item.price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-[1.5px] border-gray-300 mb-4" />

          {/* Financial Summary */}
          <div className="space-y-1.5 mb-4 text-[14px] font-medium text-gray-800">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp. {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak Kampus</span>
              <span>Rp. {mockOrder.campus_tax.toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <div className="border-t-[1.5px] border-gray-800 mb-4" />
          
          <div className="flex justify-between font-bold text-[15px] text-gray-900 mb-4">
            <span>Total Harga</span>
            <span>Rp. {grandTotal.toLocaleString('id-ID')}</span>
          </div>

          <div className="border-t-[1.5px] border-gray-800 mb-4" />

          {/* Order Details */}
          <div className="space-y-3.5 text-[14px]">
            <div>
              <p className="font-bold text-gray-900 mb-1">Catatan</p>
              <p className="font-medium text-gray-700">{mockOrder.notes}</p>
            </div>
            <div className="border-t-[1.5px] border-gray-300" />
            <div>
              <p className="font-bold text-gray-900 mb-1">Metode Pelayanan</p>
              <p className="font-medium text-gray-700">{mockOrder.service_method}</p>
            </div>
            <div className="border-t-[1.5px] border-gray-300" />
            <div>
              <p className="font-bold text-gray-900 mb-1">Metode Pembayaran</p>
              <p className="font-medium text-gray-700">{mockOrder.payment_method}</p>
            </div>
            <div className="border-t-[1.5px] border-gray-300" />
            <div>
              <p className="font-bold text-gray-900 mb-1">Info Pengambilan</p>
              <p className="font-medium text-gray-700 leading-relaxed">
                Silahkan ambil di {pickupInfoText}.
              </p>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <button className="w-full bg-[#8B4513] text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform">
          Pesan Lagi
        </button>

        {/* Recommendations */}
        <div className="mt-8">
          <h2 className="font-bold text-gray-900 mb-4 text-[15px]">Rekomendasi Menu Lainnya</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {mockRecommendations.map(rec => (
              <div key={rec.id} className="flex-shrink-0 w-28 bg-[#DFD9D1] rounded-2xl p-1.5 shadow-sm flex flex-col relative border border-black/5">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-1">
                  <img src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
                  <button className="absolute bottom-1 right-1 w-6 h-6 bg-[#8B4513] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform z-10 border border-white/20">
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="pb-1 px-1 pt-1 flex-1 flex items-center justify-center">
                  <p className="text-gray-900 font-bold text-[13px] text-center leading-tight">
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
