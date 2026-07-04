"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VaPaymentProps {
  orderId: string;
  totalPrice: number;
  bankName: string;
}

export default function VaPayment({ orderId, totalPrice, bankName }: VaPaymentProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60 - 1); // 23:59:59
  const [isExpired, setIsExpired] = useState(false);
  const [activeTab, setActiveTab] = useState<'m-BCA' | 'ATM' | 'Internet Banking'>('m-BCA');
  
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedTotal, setCopiedTotal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const vaNumber = "8810 2943 0291 5"; // Mock VA

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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, type: 'va' | 'total') => {
    navigator.clipboard.writeText(text);
    if (type === 'va') {
      setCopiedVa(true);
      setTimeout(() => setCopiedVa(false), 2000);
    } else {
      setCopiedTotal(true);
      setTimeout(() => setCopiedTotal(false), 2000);
    }
  };

  const handleCheckStatus = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      router.push(`/pesanan/${orderId}`);
    }, 2000);
  };

  const getBankLogoText = () => {
    if (bankName.toLowerCase().includes('bca')) return 'BCA';
    if (bankName.toLowerCase().includes('bni')) return 'BNI';
    if (bankName.toLowerCase().includes('mandiri')) return 'MDR';
    return 'BANK';
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col font-sans pb-8">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center shadow-md">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg flex-1 text-center pr-10">Pembayaran Virtual Account</h1>
      </header>

      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Timer Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle flex justify-between items-center">
          <div>
            <p className="text-sm text-text-muted font-medium mb-1">Selesaikan pembayaran dalam</p>
            <p className={`text-3xl font-bold ${isExpired ? 'text-red-500' : 'text-red-600'}`}>
              {isExpired ? 'Expired' : formatTime(timeLeft)}
            </p>
          </div>
          <div className="bg-orange-100 text-primary px-3 py-1.5 rounded-full text-xs font-bold text-center">
            MENUNGGU<br/>BAYAR
          </div>
        </div>

        {/* VA Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-orange-100 text-primary font-bold flex items-center justify-center rounded-xl">
              {getBankLogoText()}
            </div>
            <div>
              <p className="font-bold text-text-primary text-base">{bankName} Virtual Account</p>
              <p className="text-xs text-text-muted">Transfer sesuai nominal yang tertera</p>
            </div>
          </div>
          
          <div className="border-t border-dashed border-gray-200 pt-4 mb-4">
            <p className="text-xs text-text-muted font-medium mb-1">Nomor Virtual Account</p>
            <div className="flex justify-between items-center">
              <p className="text-2xl font-bold text-gray-800 tracking-wide">{vaNumber}</p>
              <button 
                onClick={() => handleCopy(vaNumber.replace(/\s/g, ''), 'va')}
                className="bg-orange-100 text-primary px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 active:scale-95 transition-transform"
              >
                {copiedVa ? <CheckCircle2 size={16} /> : 'Salin'}
              </button>
            </div>
          </div>
        </div>

        {/* Total Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle flex justify-between items-center">
          <div>
            <p className="text-xs text-text-muted font-medium mb-1">Total Pembayaran</p>
            <p className="text-2xl font-bold text-primary mb-1">Rp {Number(totalPrice).toLocaleString('id-ID')}</p>
            <p className="text-xs text-text-muted">Nomor Pesanan #{orderId || '000'}</p>
          </div>
          <button 
            onClick={() => handleCopy(totalPrice.toString(), 'total')}
            className="bg-orange-100 text-primary px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 active:scale-95 transition-transform"
          >
            {copiedTotal ? <CheckCircle2 size={16} /> : 'Salin'}
          </button>
        </div>

        {/* Instructions Card */}
        <div className="bg-[#FDEBD0] rounded-2xl p-5 border border-orange-200">
          <h3 className="font-bold text-primary mb-4 text-base">Cara Pembayaran</h3>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {(['m-BCA', 'ATM', 'Internet Banking'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-primary border border-primary/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="text-sm text-primary/80 space-y-3">
            {activeTab === 'm-BCA' && (
              <ol className="list-decimal list-inside space-y-2">
                <li>Buka aplikasi m-banking Anda, login dengan kode akses Anda</li>
                <li>Pilih menu m-Transfer &gt; Virtual Account</li>
                <li>Masukkan nomor Virtual Account di atas</li>
                <li>Periksa detail tagihan, lalu masukkan PIN untuk konfirmasi</li>
                <li>Simpan bukti pembayaran sebagai referensi</li>
              </ol>
            )}
            {activeTab === 'ATM' && (
              <ol className="list-decimal list-inside space-y-2">
                <li>Masukkan kartu ATM dan PIN Anda</li>
                <li>Pilih Transaksi Lainnya &gt; Transfer</li>
                <li>Pilih ke Rekening Virtual Account</li>
                <li>Masukkan nomor Virtual Account di atas</li>
                <li>Periksa detail tagihan, lalu pilih Ya/Benar</li>
                <li>Simpan struk sebagai bukti pembayaran</li>
              </ol>
            )}
            {activeTab === 'Internet Banking' && (
              <ol className="list-decimal list-inside space-y-2">
                <li>Login ke Internet Banking Anda</li>
                <li>Pilih menu Transfer &gt; Virtual Account</li>
                <li>Masukkan nomor Virtual Account di atas</li>
                <li>Periksa detail tagihan dan masukkan token/PIN</li>
                <li>Simpan bukti pembayaran sebagai referensi</li>
              </ol>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button 
            onClick={handleCheckStatus}
            disabled={isChecking || isExpired}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isChecking ? <><Loader2 size={20} className="animate-spin" /> Memeriksa...</> : 'Cek Status Pembayaran'}
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
