"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { Search, MoreVertical, Plus, ArrowLeft, Trash2, AlertTriangle, Phone, Mail, FileText, CheckCircle, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useUsers } from '@/hooks/useApi';
import { api } from '@/services/api';

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  status?: "aktif" | "nonaktif";
  joinDate?: string;
  phone?: string;
  email?: string;
  storeName?: string;
  totalProducts?: number;
  totalSales?: string;
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} className="text-text-muted" />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-3.5 border border-border-subtle rounded-2xl bg-white text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-card"
        placeholder="Cari toko atau penjual..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ── Multi-step Form: Tambah Penjual (menggunakan Supabase Auth) ─────────────
function AddSellerForm({ initialData, onClose, onSave }: { initialData?: User | null; onClose: () => void; onSave: (u: User) => void }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    storeName: initialData?.storeName || "",
    name: initialData?.name || "",
    // Username tetap ada untuk edit, tapi email + password wajib untuk create
    username: initialData?.username || "",
    email: initialData?.email || "",
    password: "",          // ← diisi user, bukan hardcoded
    phone: initialData?.phone || "",
    account: "",
  });

  const handleNext = () => {
    // Validasi per step sebelum maju
    if (step === 1 && !formData.storeName.trim()) {
      setErrorMsg("Nama toko wajib diisi.");
      return;
    }
    if (step === 2) {
      if (!formData.name.trim()) { setErrorMsg("Nama pemilik wajib diisi."); return; }
      if (!initialData) {
        // Hanya validasi email & password saat create baru
        if (!formData.email.trim()) { setErrorMsg("Email wajib diisi."); return; }
        if (!formData.password || formData.password.length < 8) {
          setErrorMsg("Password minimal 8 karakter."); return;
        }
      }
    }
    setErrorMsg(null);
    setStep(s => Math.min(s + 1, 3));
  };

  const handlePrev = () => { setErrorMsg(null); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (initialData) {
        // ── Mode Edit: update data profil saja (bukan reset password) ──
        const updatedUser: User = {
          ...initialData,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          storeName: formData.storeName,
        };
        onSave(updatedUser);
      } else {
        // ── Mode Tambah Baru: gunakan Supabase Auth ─────────────────────
        // api.createUser memanggil /api/admin/create-user yang menggunakan
        // supabaseAdmin.auth.admin.createUser() — password tersimpan benar!
        const result = await api.createUser({
          email: formData.email,
          password: formData.password,        // ← password asli dari form
          fullName: formData.name,
          role: 'seller',
          username: formData.username || formData.email.split('@')[0],
          storeName: formData.storeName,
        });

        // Susun objek User untuk ditampilkan di UI
        const newUser: User = {
          id: result.userId,
          username: formData.username || formData.email.split('@')[0],
          name: formData.name,
          role: 'seller',
          status: 'aktif',
          joinDate: new Date().toLocaleDateString('id-ID'),
          phone: formData.phone,
          email: formData.email,
          storeName: formData.storeName,
          totalProducts: 0,
          totalSales: '0',
        };
        onSave(newUser);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in p-2 pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={step === 1 ? onClose : handlePrev} className="p-2 hover:bg-sidebar rounded-xl transition-colors">
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">
          {initialData ? "Edit " : "Tambah "}
          {step === 1 ? "Data Toko" : step === 2 ? "Data Pemilik" : "Data Rekening"}
        </h2>
      </div>

      {/* Step Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-border'}`} />
        ))}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {step === 1 && (
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Nama Toko</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={e => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none hover:border-primary/50 transition-colors"
              placeholder="Masukkan nama toko"
            />
          </div>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1.5">Nama Pemilik</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none hover:border-primary/50 transition-colors"
                placeholder="Nama lengkap pemilik"
              />
            </div>

            {/* Email & Password & Username — hanya untuk user baru */}
            {!initialData && (
              <>
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1.5 mt-2">Username Login</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none hover:border-primary/50 transition-colors"
                      placeholder="Contoh: penjualbaru"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1.5 mt-2">Email (Opsional di Fallback)</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3.5 text-text-muted" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none hover:border-primary/50 transition-colors"
                      placeholder="penjual@email.com"
                      autoComplete="new-email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1.5 mt-2">
                    Password Login
                    <span className="ml-2 text-[10px] font-normal text-text-muted">(min. 8 karakter)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 pr-12 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none hover:border-primary/50 transition-colors"
                      placeholder="Buat password yang kuat"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-3.5 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          formData.password.length === 0 ? 'bg-border' :
                          formData.password.length < 6 ? (i <= 1 ? 'bg-red-400' : 'bg-border') :
                          formData.password.length < 10 ? (i <= 2 ? 'bg-yellow-400' : 'bg-border') :
                          formData.password.length < 14 ? (i <= 3 ? 'bg-blue-400' : 'bg-border') :
                          'bg-green-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-text-primary mb-1.5 mt-2">Nomor Handphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none hover:border-primary/50 transition-colors"
                placeholder="Contoh: 0812..."
              />
            </div>
          </>
        )}

        {step === 3 && (
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Nomor Rekening</label>
            <input
              type="text"
              value={formData.account}
              onChange={e => setFormData({ ...formData, account: e.target.value })}
              className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none hover:border-primary/50 transition-colors"
              placeholder="Masukkan No. Rekening"
            />
            <p className="text-xs text-text-muted mt-2">Nomor rekening digunakan untuk pencairan dana penjualan.</p>
          </div>
        )}
      </div>

      <button
        onClick={step === 3 ? handleSubmit : handleNext}
        disabled={isSubmitting}
        className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-colors shadow-card flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : step === 3 ? (
          <><CheckCircle size={20} /> Simpan Penjual</>
        ) : (
          "Selanjutnya"
        )}
      </button>
    </div>
  );
}

// ── Detail View ─────────────────────────────────────────────────────────────
function DetailView({
  seller,
  onBack,
  onEdit,
  onTransfer,
  onDeactivate,
  onDelete
}: {
  seller: User;
  onBack: () => void;
  onEdit: () => void;
  onTransfer: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="animate-fade-in pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-sidebar rounded-xl transition-colors">
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">Detail Toko</h2>
      </div>

      <Card className="border border-border-subtle mb-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-subtle rounded-full blur-2xl opacity-50 pointer-events-none" />
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-text-primary">{seller.storeName}</h3>
            <p className="text-sm text-text-muted font-medium">{seller.name}</p>
            <Badge status={(seller.status as "aktif" | "nonaktif") || "aktif"} />
          </div>
        </div>
        <div className="flex justify-between items-center text-sm mb-6 relative z-10">
          <div className="text-text-muted font-medium uppercase tracking-wider text-[10px]">SELLER ID<br/><span className="text-text-primary font-bold text-sm normal-case">{seller.id}</span></div>
          <div className="text-text-muted font-medium uppercase tracking-wider text-[10px] text-right">JOINED DATE<br/><span className="text-text-primary font-bold text-sm normal-case">{seller.joinDate}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2 bg-sidebar rounded-2xl p-4 text-center relative z-10">
          <div>
            <p className="text-lg font-extrabold text-primary">{seller.totalProducts}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Produk Aktif</p>
          </div>
          <div className="border-l border-border-subtle">
            <p className="text-lg font-extrabold text-primary">{seller.totalSales}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Total Sales</p>
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-3xl p-6 shadow-card border border-border-subtle space-y-4 mb-8">
        <h4 className="text-sm font-bold text-text-primary mb-2">Contact Person:</h4>
        <div className="flex items-center gap-3 py-2 border-b border-border-subtle">
          <Phone size={18} className="text-green-600" />
          <span className="text-sm font-bold text-text-primary">{seller.phone || "-"}</span>
        </div>
        <div className="flex items-center gap-3 py-2 border-b border-border-subtle">
          <Mail size={18} className="text-blue-500" />
          <span className="text-sm font-bold text-text-primary">{seller.email || "-"}</span>
        </div>
        <button onClick={onEdit} className="w-full flex items-center gap-3 py-2 border-b border-border-subtle text-left group">
          <FileText size={18} className="text-text-muted group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-text-primary uppercase group-hover:text-primary">Edit Data Toko & Penjual</span>
        </button>
        <button onClick={onTransfer} className="w-full flex items-center gap-3 py-2 border-b border-border-subtle text-left group">
          <RefreshCw size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-blue-500 uppercase">Ganti Kepemilikan Toko</span>
        </button>
        <button onClick={onDeactivate} className="w-full flex items-center gap-3 py-2 border-b border-border-subtle text-left group">
          <AlertTriangle size={18} className="text-status-libur-dot group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-text-primary uppercase group-hover:text-status-libur-text">Suspend / Peringatan Penjual</span>
        </button>
        <button onClick={onDelete} className="w-full flex items-center gap-3 py-2 text-left group">
          <Trash2 size={18} className="text-danger group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-danger uppercase">Hapus Akun Toko Permanen</span>
        </button>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function KelolaPenjual() {
  const [search, setSearch] = useState("");
  // useUsers sudah include Realtime subscription (lihat useApi.ts)
  const { users: sellers, isLoading, mutateUsers } = useUsers("seller");

  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [transferData, setTransferData] = useState({ name: '', phone: '', email: '' });

  const handleSaveUser = async (savedUser: User) => {
    // Realtime subscription akan auto-refresh — mutateUsers untuk jaga-jaga
    mutateUsers();
    setIsAddingOrEditing(false);
    setSelectedSeller(null);
  };

  const handleDeactivate = async () => {
    if (!selectedSeller) return;
    const newStatus = selectedSeller.status === 'aktif' ? 'nonaktif' : 'aktif';
    await api.updateUserStatus(selectedSeller.id, newStatus === 'aktif');
    setSelectedSeller({ ...selectedSeller, status: newStatus as "aktif" | "nonaktif" });
    mutateUsers();
    setShowDeactivateModal(false);
  };

  const handleDelete = async () => {
    if (!selectedSeller || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      // api.deleteUser sekarang memanggil /api/admin/delete-user
      // yang menggunakan supabaseAdmin.auth.admin.deleteUser()
      // → menghapus PERMANEN dari auth.users + semua cascade data
      await api.deleteUser(selectedSeller.id);
      setSelectedSeller(null);
      setShowDeleteModal(false);
      // Realtime subscription akan auto-remove row dari UI
      mutateUsers();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menghapus';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransferOwnership = () => {
    alert("Fitur ini perlu API Update khusus, saat ini hanya mock");
    setShowTransferModal(false);
  };

  if (isAddingOrEditing) {
    return <AddSellerForm initialData={selectedSeller} onClose={() => setIsAddingOrEditing(false)} onSave={handleSaveUser} />;
  }

  if (selectedSeller) {
    return (
      <>
        <DetailView
          seller={selectedSeller}
          onBack={() => setSelectedSeller(null)}
          onEdit={() => setIsAddingOrEditing(true)}
          onTransfer={() => setShowTransferModal(true)}
          onDeactivate={() => setShowDeactivateModal(true)}
          onDelete={() => setShowDeleteModal(true)}
        />

        {/* Modals */}
        <Modal isOpen={showDeactivateModal} onClose={() => setShowDeactivateModal(false)} title="Ubah Status?" icon={<AlertTriangle size={24} />}>
          <p className="mb-6">Status toko <strong>{selectedSeller.storeName}</strong> akan diubah.</p>
          <div className="flex flex-col gap-3">
            <button className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all" onClick={handleDeactivate}>Ya, Ubah</button>
            <button className="w-full py-3.5 text-text-secondary font-bold rounded-2xl hover:bg-sidebar transition-colors" onClick={() => setShowDeactivateModal(false)}>Batal</button>
          </div>
        </Modal>

        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Hapus Toko Permanen?" isDanger icon={<Trash2 size={24} />}>
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            ⚠️ Tindakan ini akan menghapus akun dari sistem Auth Supabase secara permanen. Toko dan semua pesanan terkait juga akan dihapus otomatis.
          </div>
          <p className="mb-6">Akun <strong>{selectedSeller.name}</strong> ({selectedSeller.storeName}) akan dihapus permanen.</p>
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{deleteError}</div>
          )}
          <div className="flex flex-col gap-3">
            <button
              className="w-full py-3.5 bg-danger text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus Permanen"}
            </button>
            <button className="w-full py-3.5 border border-border-subtle text-text-secondary font-bold rounded-2xl hover:bg-sidebar transition-colors" onClick={() => setShowDeleteModal(false)}>Batal</button>
          </div>
        </Modal>

        <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Ganti Kepemilikan Toko" icon={<RefreshCw size={24} className="text-blue-500" />}>
          <p className="mb-4 text-sm text-text-secondary leading-relaxed">
            Perhatian: Mengganti pemilik toko akan <strong className="text-danger">mereset data penjualan dan produk</strong> toko menjadi 0 untuk pemilik baru.
          </p>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Nama Pemilik Baru</label>
              <input type="text" value={transferData.name} onChange={e => setTransferData({...transferData, name: e.target.value})} className="w-full px-4 py-3 border border-border-subtle rounded-xl text-sm" placeholder="Masukkan nama..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">No. Handphone Baru</label>
              <input type="text" value={transferData.phone} onChange={e => setTransferData({...transferData, phone: e.target.value})} className="w-full px-4 py-3 border border-border-subtle rounded-xl text-sm" placeholder="08..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Email Baru</label>
              <input type="email" value={transferData.email} onChange={e => setTransferData({...transferData, email: e.target.value})} className="w-full px-4 py-3 border border-border-subtle rounded-xl text-sm" placeholder="email@..." />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button className="w-full py-3.5 bg-blue-500 text-white font-bold rounded-2xl shadow-sm hover:bg-blue-600 transition-all" onClick={handleTransferOwnership}>
              Ganti Pemilik & Reset Data
            </button>
            <button className="w-full py-3.5 border border-border-subtle text-text-secondary font-bold rounded-2xl hover:bg-sidebar transition-colors" onClick={() => setShowTransferModal(false)}>
              Batal
            </button>
          </div>
        </Modal>
      </>
    );
  }

  const filteredSellers = sellers.filter((s: User) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.storeName ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-text-primary hidden lg:block tracking-tight">Kelola Akun Penjual</h2>
        <button
          onClick={() => { setSelectedSeller(null); setIsAddingOrEditing(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-hover transition-all shadow-card hover:shadow-card-hover ml-auto"
        >
          <Plus size={18} className="stroke-[2.5]" />
          Tambah Toko Baru
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <Card className="border border-border-subtle text-center py-6 bg-gradient-to-br from-white to-primary-subtle/20">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Total Toko</p>
        <p className="text-4xl font-extrabold text-primary">{sellers.length}</p>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-40 bg-sidebar animate-pulse rounded-3xl" />
            <div className="h-40 bg-sidebar animate-pulse rounded-3xl" />
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-10 text-text-muted">Tidak ada toko ditemukan</div>
        ) : (
          filteredSellers.map((seller: User) => (
            <Card key={seller.id} hover className="border border-border-subtle">
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0 pr-4">
                  <p className="font-bold text-text-primary text-lg truncate leading-tight">{seller.storeName}</p>
                  <p className="text-sm text-text-muted mt-0.5">{seller.name}</p>
                </div>
                <button className="p-1 hover:bg-sidebar rounded-full transition-colors flex-shrink-0 text-text-muted">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="flex justify-between items-center text-xs mb-4">
                <div className="text-text-muted font-bold uppercase tracking-wider text-[10px]">SELLER ID<br/><span className="text-text-primary font-extrabold text-xs normal-case">{seller.id}</span></div>
                <div className="text-text-muted font-bold uppercase tracking-wider text-[10px] text-right">JOINED DATE<br/><span className="text-text-primary font-extrabold text-xs normal-case">{seller.joinDate}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-sidebar rounded-xl p-3 text-center mb-4">
                <div>
                  <p className="text-base font-extrabold text-primary">{seller.totalProducts}</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Produk</p>
                </div>
                <div className="border-l border-border-subtle">
                  <p className="text-base font-extrabold text-primary">{seller.totalSales}</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Sales</p>
                </div>
              </div>
              <button onClick={() => setSelectedSeller(seller)} className="w-full py-2.5 text-sm font-bold text-primary hover:bg-primary-subtle rounded-xl transition-colors text-left flex items-center justify-between">
                Detail Toko <ArrowLeft size={16} className="rotate-180" />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
