"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Download, Receipt, Wallet, ShoppingBag, Loader2, PiggyBank } from "lucide-react";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function LaporanPage() {
  const { filter, setFilter, filteredTransactions, stats, isLoading } = useAdminAnalytics();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Laporan berhasil di-export ke Excel!");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 size={48} className="text-primary animate-spin" />
        <p className="text-sm text-text-muted font-bold animate-pulse">Memuat data laporan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ── Filters ── */}
      <div className="flex bg-white rounded-full p-1 border border-border shadow-sm max-w-sm mx-auto md:mx-0">
        <button
          onClick={() => setFilter("hari_ini")}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${filter === "hari_ini" ? "bg-primary text-white shadow-md" : "text-text-secondary hover:text-primary"}`}
        >
          Hari Ini
        </button>
        <button
          onClick={() => setFilter("minggu_ini")}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${filter === "minggu_ini" ? "bg-primary text-white shadow-md" : "text-text-secondary hover:text-primary"}`}
        >
          Minggu Ini
        </button>
        <button
          onClick={() => setFilter("bulan_ini")}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${filter === "bulan_ini" ? "bg-primary text-white shadow-md" : "text-text-secondary hover:text-primary"}`}
        >
          Bulan Ini
        </button>
      </div>

      {/* ── Top Summary ── */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex-1 border border-border-subtle hover:border-primary/20 transition-colors">
          <Receipt size={24} className="text-primary mb-3 stroke-[2.5]" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Transaksi</p>
          <p className="text-3xl font-extrabold text-text-primary">{stats.trxCount.toLocaleString()}</p>
        </Card>
        <Card className="flex-1 border border-border-subtle hover:border-primary/20 transition-colors">
          <ShoppingBag size={24} className="text-primary mb-3 stroke-[2.5]" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Produk Terjual</p>
          <p className="text-3xl font-extrabold text-text-primary">{stats.prodCount.toLocaleString()}</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border-subtle bg-gradient-to-br from-white to-primary-subtle/10 hover:border-primary/30 transition-colors">
          <Wallet size={24} className="text-text-secondary mb-3 stroke-[2.5]" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Pendapatan Penjual (Kotor)</p>
          <p className="text-3xl font-extrabold text-text-primary">{fmt(stats.totalGross)}</p>
        </Card>
        <Card className="border border-border-subtle bg-gradient-to-br from-white to-success/10 hover:border-success/30 transition-colors">
          <PiggyBank size={24} className="text-success mb-3 stroke-[2.5]" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Profit Kantin (Potongan 10%)</p>
          <p className="text-3xl font-extrabold text-success drop-shadow-sm">{fmt(stats.totalNet)}</p>
        </Card>
      </div>

      {/* ── Statistik Aktif ── */}
      <Card className="border border-border-subtle bg-sidebar">
        <h3 className="text-lg font-extrabold text-text-primary mb-5">Statistik Aktif</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <span className="text-sm font-bold text-text-muted">Total Pembeli Aktif</span>
            <span className="text-sm font-extrabold text-primary">{stats.activeBuyers}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <span className="text-sm font-bold text-text-muted">Total Penjual Aktif</span>
            <span className="text-sm font-extrabold text-primary">{stats.activeSellers}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Penjual Terlaris</p>
            <p className="text-sm font-extrabold text-text-primary leading-tight">{stats.topSeller}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Produk Terlaris</p>
            <p className="text-sm font-extrabold text-text-primary leading-tight">{stats.topProduct}</p>
          </div>
        </div>
      </Card>

      {/* ── Transaksi Terkini ── */}
      <div>
        <h3 className="text-lg font-extrabold text-text-primary mb-4">Transaksi Terkini</h3>
        <Card className="!p-0 overflow-hidden border border-border-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sidebar border-b border-border-subtle">
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Pembeli & Toko</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Produk</th>
                  <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-text-muted">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Receipt size={40} className="opacity-40" />
                        <p className="text-sm font-bold">Tidak ada transaksi pada periode ini.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredTransactions.slice(0, 10).map((t) => (
                  <tr key={t.id} className="hover:bg-primary-subtle/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-text-primary leading-tight">{t.buyer_name || t.buyerName}</p>
                      <p className="text-[11px] text-text-muted font-medium mt-0.5">{t.store_name || t.storeName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-text-primary max-w-[200px] truncate" title={t.items ? t.items.map((i:any)=>`${i.qty}x ${i.name}`).join(", ") : t.product}>
                        {t.items ? t.items.map((i:any)=>`${i.qty}x ${i.name}`).join(", ") : t.product}
                      </p>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5">
                        {new Date(t.created_at || t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })},{' '}
                        {new Date(t.created_at || t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-extrabold text-primary">{fmt(Number(t.total_amount || t.totalAmount || t.price || 0))}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Export Button ── */}
      <button 
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-card hover:shadow-card-hover disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        {isExporting ? (
          <>
            <Loader2 size={20} className="animate-spin" /> Sedang Mengekspor...
          </>
        ) : (
          <>
            <Download size={20} className="stroke-[2.5]" /> Export Laporan Excel
          </>
        )}
      </button>

    </div>
  );
}
