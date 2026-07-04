"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QrisPaymentProps {
  orderId: string;
  totalPrice: number;
}

export default function QrisPayment({ orderId, totalPrice }: QrisPaymentProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    // Simulated download
    alert("Kode QR berhasil diunduh (Simulasi)");
  };

  const code = "2100310997"; // Mock static code or dynamically generate

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col font-sans pb-8">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center shadow-md">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg flex-1 text-center pr-10">Pembayaran QRis</h1>
      </header>

      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Timer Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-text-muted font-medium mb-1">Selesaikan Pembayaran Dalam</p>
              <p className={`text-3xl font-bold ${isExpired ? 'text-red-500' : 'text-red-600'}`}>
                {isExpired ? 'Expired' : formatTime(timeLeft)}
              </p>
            </div>
            <div className="bg-orange-100 text-primary px-3 py-1.5 rounded-full text-xs font-bold text-center">
              Menunggu<br/>Pembayaran
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center">
            {/* QR Code Mock */}
            <div className="w-56 h-56 bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=QRIS_${orderId}_${totalPrice}`} 
                alt="QR Code" 
                className={`w-full h-full object-contain ${isExpired ? 'opacity-20' : 'opacity-100'}`}
              />
            </div>
            
            <div className="bg-gray-200 px-4 py-2 rounded-full flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600 font-medium">Code :</span>
              <span className="text-base font-bold text-gray-800">{code}</span>
            </div>

            <p className="text-center text-sm text-text-muted px-4">
              Scan kode QR di atas menggunakan aplikasi, e-wallet atau m-banking yang mendukung QRIS
            </p>
          </div>
        </div>

        {/* Total Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle">
          <p className="text-sm text-text-muted mb-1">Total Pembayaran :</p>
          <p className="text-2xl font-bold text-primary mb-1">Rp. {Number(totalPrice).toLocaleString('id-ID')}</p>
          <p className="text-sm text-text-muted">Nomor Pesanan #{orderId || '000'}</p>
        </div>

        {/* Instructions Card */}
        <div className="bg-[#FDEBD0] rounded-2xl p-5 border border-orange-200">
          <h3 className="font-bold text-primary mb-3">Cara Pembayaran</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-primary/80">
            <li>Buka aplikasi e-wallet atau m-banking Anda</li>
            <li>Pilih menu Scan / Bayar dengan QRIS</li>
            <li>Arahkan kamera ke kode QR di atas</li>
            <li>Periksa nominal, lalu selesaikan pembayaran</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button 
            onClick={handleDownload}
            disabled={isExpired}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            Unduh Kode QR
          </button>
          <button 
            onClick={() => router.back()}
            className="w-full bg-transparent border-2 border-primary text-primary font-bold py-3.5 rounded-xl transition-all active:scale-95"
          >
            Ganti Metode Pembayaran
          </button>
        </div>
      </main>
    </div>
  );
}
