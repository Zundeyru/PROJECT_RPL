"use client";

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QrisPayment from '@/components/payment/QrisPayment';
import VaPayment from '@/components/payment/VaPayment';
import { Loader2 } from 'lucide-react';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('order_id') || '';
  const totalPrice = Number(searchParams.get('total_price')) || 0;
  const method = searchParams.get('method') || '';

  useEffect(() => {
    if (!method || !orderId || !totalPrice) {
      // If missing params, redirect back to checkout
      router.replace('/checkout');
    }
  }, [method, orderId, totalPrice, router]);

  if (!method || !orderId || !totalPrice) {
    return null;
  }

  if (method === 'QRIS') {
    return <QrisPayment orderId={orderId} totalPrice={totalPrice} />;
  }

  if (method.startsWith('Bank')) {
    return <VaPayment orderId={orderId} totalPrice={totalPrice} bankName={method} />;
  }

  // Fallback for unexpected methods
  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-4">
      <p className="text-gray-800 font-bold mb-4">Metode pembayaran tidak didukung.</p>
      <button 
        onClick={() => router.back()} 
        className="bg-primary text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform"
      >
        Kembali ke Checkout
      </button>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-primary font-bold animate-pulse">Memuat halaman pembayaran...</p>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
