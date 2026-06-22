"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { Search, MoreVertical, Edit2, Ban, Trash2, ArrowLeft, UserPlus, Save, AlertTriangle, User as UserIcon, Phone, Mail, FileText, CheckCircle } from "lucide-react";
import { useUsers } from '@/hooks/useApi';
import { api } from '@/services/api';
import { TableRowSkeleton } from '@/components/Skeletons';

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  status?: "aktif" | "nonaktif";
  joinDate?: string;
  phone?: string;
  email?: string;
  nim?: string;
  faculty?: string;
  gender?: "Laki-laki" | "Perempuan";
  birthDate?: string;
}

// ── Search Input ────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} className="text-text-muted" />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-3.5 border border-border-subtle rounded-2xl bg-white text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-card"
        placeholder="Cari nama atau NIM..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ── Buyer Row ───────────────────────────────────────────────────────────────
function BuyerCard({ buyer, onView }: { buyer: User; onView: (b: User) => void }) {
  const initials = buyer.name.split(" ").map(w => w[0]).join("").substring(0,2).toUpperCase();

  return (
    <Card className="!py-4 cursor-pointer hover:border-primary/20 transition-all group" onClick={() => onView(buyer)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-subtle to-[#EAD8C8] flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-bold text-text-primary text-sm leading-tight">{buyer.name}</p>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                Mahasiswa
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5 truncate font-medium">NIM: {buyer.nim || "-"}</p>
            <p className="text-xs text-text-muted truncate">{buyer.faculty || "-"}</p>
            <div className="mt-2">
              <Badge status={(buyer.status as any) || "aktif"} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:bg-primary-subtle hover:text-primary transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </Card>
  );
}

// ── Buyer Form (Add / Edit) ─────────────────────────────────────────────────
function BuyerForm({ 
  initialData, 
  onClose, 
  onSave 
}: { 
  initialData?: User | null; 
  onClose: () => void; 
  onSave: (u: User) => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    nim: initialData?.nim || "",
    faculty: initialData?.faculty || "",
    gender: initialData?.gender || "Laki-laki",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    birthDate: initialData?.birthDate || "",
  });

  const handleSubmit = () => {
    const isEditing = !!initialData;
    const userToSave: User = {
      ...(initialData || {} as User),
      id: initialData?.id || `BYR-${Date.now()}`,
      username: initialData?.username || formData.name.toLowerCase().replace(/\s/g, "_"),
      name: formData.name,
      role: "buyer",
      status: initialData?.status || "aktif",
      joinDate: initialData?.joinDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      phone: formData.phone,
      email: formData.email,
      nim: formData.nim,
      faculty: formData.faculty,
      gender: formData.gender as any,
      birthDate: formData.birthDate,
    };
    onSave(userToSave);
  };

  return (
    <div className="animate-fade-in p-2 pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onClose} className="p-2 hover:bg-sidebar rounded-xl transition-colors">
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">
          {initialData ? "Edit Data Pembeli" : "Tambah Pembeli Baru"}
        </h2>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-border-subtle space-y-5">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-text-primary mb-1.5">Nama Lengkap</label>
          <div className="relative">
            <UserIcon size={18} className="absolute left-4 top-3.5 text-text-muted" />
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full pl-12 pr-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all hover:border-primary/50" placeholder="Masukkan nama lengkap" />
          </div>
        </div>

        {/* NIM & Faculty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">NIM / NIP</label>
            <div className="relative">
              <FileText size={18} className="absolute left-4 top-3.5 text-text-muted" />
              <input type="text" value={formData.nim} onChange={e => setFormData({ ...formData, nim: e.target.value })} className="w-full pl-12 pr-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all hover:border-primary/50" placeholder="Nomor Induk..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Fakultas / Unit</label>
            <input type="text" value={formData.faculty} onChange={e => setFormData({ ...formData, faculty: e.target.value })} className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all hover:border-primary/50" placeholder="Cth: Fakultas Teknik" />
          </div>
        </div>

        {/* Gender & Birth Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Jenis Kelamin</label>
            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as any })} className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all hover:border-primary/50 bg-white">
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Tanggal Lahir</label>
            <input type="text" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all hover:border-primary/50" placeholder="DD-MMM-YYYY (Cth: 15-May-2002)" />
          </div>
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Nomor Handphone</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-3.5 text-text-muted" />
              <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-12 pr-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all hover:border-primary/50" placeholder="0812..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1.5">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-text-muted" />
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pl-12 pr-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all hover:border-primary/50" placeholder="email@student.umm.ac.id" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button onClick={handleSubmit} className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-colors shadow-card flex items-center justify-center gap-2">
          <Save size={20} /> Simpan Data Pembeli
        </button>
      </div>
    </div>
  );
}

// ── Detail View ─────────────────────────────────────────────────────────────
function DetailView({ 
  buyer, 
  onBack,
  onEdit,
  onDeactivate,
  onDelete
}: { 
  buyer: User; 
  onBack: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="animate-fade-in pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-sidebar rounded-xl transition-colors">
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">Detail Akun Pembeli</h2>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-border-subtle space-y-4 relative overflow-hidden">
        {/* Dekoratif kotak di background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-subtle rounded-full blur-2xl opacity-50 pointer-events-none" />

        <div className="flex justify-between py-3 border-b border-border-subtle relative z-10">
          <span className="text-sm font-semibold text-text-muted">Nama</span>
          <span className="text-sm font-bold text-text-primary text-right">{buyer.name}</span>
        </div>
        <div className="flex justify-between py-3 border-b border-border-subtle relative z-10">
          <span className="text-sm font-semibold text-text-muted">NIM / NIP</span>
          <span className="text-sm font-bold text-text-primary text-right">{buyer.nim || "-"}</span>
        </div>
        <div className="flex justify-between py-3 border-b border-border-subtle relative z-10">
          <span className="text-sm font-semibold text-text-muted">Jenis Kelamin</span>
          <span className="text-sm font-bold text-text-primary text-right">{buyer.gender || "-"}</span>
        </div>
        <div className="flex justify-between py-3 border-b border-border-subtle relative z-10">
          <span className="text-sm font-semibold text-text-muted">Tanggal Lahir</span>
          <span className="text-sm font-bold text-text-primary text-right">{buyer.birthDate || "-"}</span>
        </div>
        <div className="flex justify-between py-3 border-b border-border-subtle relative z-10">
          <span className="text-sm font-semibold text-text-muted">Nomor Handphone</span>
          <span className="text-sm font-bold text-text-primary text-right">{buyer.phone || "-"}</span>
        </div>
        <div className="flex justify-between py-3 relative z-10">
          <span className="text-sm font-semibold text-text-muted">Email</span>
          <span className="text-sm font-bold text-text-primary text-right">{buyer.email || "-"}</span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button onClick={onEdit} className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-colors shadow-card">
          <Edit2 size={18} className="stroke-[2.5]" /> Edit Akun
        </button>
        <button onClick={onDeactivate} className="w-full flex items-center justify-center gap-2 py-4 bg-status-nonaktif text-status-nonaktif-text font-bold rounded-2xl hover:bg-status-nonaktif-text/10 transition-colors shadow-card">
          <Ban size={18} className="stroke-[2.5]" /> {buyer.status === 'aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
        </button>
        <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 py-4 bg-danger text-white font-bold rounded-2xl hover:bg-danger/90 transition-colors shadow-card">
          <Trash2 size={18} className="stroke-[2.5]" /> Hapus Akun Permanen
        </button>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function KelolaPembeli() {
  const [search, setSearch] = useState("");
  // useUsers sudah include Realtime subscription — UI auto-update tanpa refresh
  const { users: buyers, isLoading, mutateUsers } = useUsers("buyer");

  const [selectedBuyer, setSelectedBuyer] = useState<User | null>(null);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSaveUser = async (savedUser: User) => {
    const isExisting = buyers.some((u: User) => u.id === savedUser.id);
    if (isExisting) {
      // Update via Supabase directly
      await api.updateUserStatus(savedUser.id, savedUser.status === 'aktif');
      if (selectedBuyer?.id === savedUser.id) setSelectedBuyer(savedUser);
    } else {
      // Buyer baru — buat via API admin route (sama seperti penjual)
      await api.createUser({
        email: savedUser.email || '',
        password: 'KantinUmm123!', // default, buyer bisa reset nanti
        fullName: savedUser.name,
        role: 'buyer',
        username: savedUser.username,
      });
    }
    mutateUsers();
    setIsAddingOrEditing(false);
  };

  const handleDeactivate = async () => {
    if (!selectedBuyer) return;
    const newStatus = selectedBuyer.status === 'aktif' ? 'nonaktif' : 'aktif';
    await api.updateUserStatus(selectedBuyer.id, newStatus === 'aktif');
    setSelectedBuyer({ ...selectedBuyer, status: newStatus as "aktif" | "nonaktif" });
    mutateUsers();
    setShowDeactivateModal(false);
  };

  const handleDelete = async () => {
    if (!selectedBuyer || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      // Hapus PERMANEN via /api/admin/delete-user (menggunakan service_role key)
      await api.deleteUser(selectedBuyer.id);
      setSelectedBuyer(null);
      setShowDeleteModal(false);
      // Realtime subscription akan auto-remove row dari daftar
      mutateUsers();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menghapus akun';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAddingOrEditing) {
    return <BuyerForm initialData={selectedBuyer} onClose={() => setIsAddingOrEditing(false)} onSave={handleSaveUser} />;
  }

  if (selectedBuyer) {
    return (
      <>
        <DetailView 
          buyer={selectedBuyer} 
          onBack={() => setSelectedBuyer(null)} 
          onEdit={() => setIsAddingOrEditing(true)}
          onDeactivate={() => setShowDeactivateModal(true)}
          onDelete={() => setShowDeleteModal(true)}
        />

        {/* Modals */}
        <Modal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          title={selectedBuyer.status === 'aktif' ? "Nonaktifkan Akun?" : "Aktifkan Akun?"}
          icon={<AlertTriangle size={24} />}
        >
          <p className="mb-6">
            Akun pembeli <strong className="text-text-primary">{selectedBuyer.name}</strong> akan {selectedBuyer.status === 'aktif' ? 'dinonaktifkan' : 'diaktifkan'}.
          </p>
          <div className="flex flex-col gap-3">
            <button
              className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all"
              onClick={handleDeactivate}
            >
              Ya, {selectedBuyer.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button
              className="w-full py-3.5 text-text-secondary font-bold rounded-2xl hover:bg-sidebar transition-colors"
              onClick={() => setShowDeactivateModal(false)}
            >
              Batal
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Hapus Akun Permanen?"
          isDanger
          icon={<Trash2 size={24} />}
        >
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            ⚠️ Akun akan dihapus permanen dari sistem. Semua pesanan terkait juga akan dihapus otomatis.
          </div>
          <p className="mb-6">
            Akun pembeli <strong className="text-text-primary">{selectedBuyer.name}</strong> akan dihapus permanen.
          </p>
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
            <button
              className="w-full py-3.5 border border-border-subtle text-text-secondary font-bold rounded-2xl hover:bg-sidebar transition-colors"
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </button>
          </div>
        </Modal>
      </>
    );
  }

  const filteredBuyers = buyers.filter((b) => {
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || (b.nim ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-text-primary hidden lg:block tracking-tight">Kelola Akun Pembeli</h2>
        <button onClick={() => { setSelectedBuyer(null); setIsAddingOrEditing(true); }} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-hover transition-all shadow-card hover:shadow-card-hover ml-auto">
          <UserPlus size={18} className="stroke-[2.5]" />
          Tambah
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="border border-border-subtle bg-gradient-to-br from-white to-primary-subtle/20">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Total Pembeli</p>
          <p className="text-3xl md:text-4xl font-extrabold text-primary">{buyers.length}</p>
          <p className="text-xs text-status-aktif-text font-bold mt-1.5">+12 hari ini</p>
        </Card>
        <Card className="border border-border-subtle bg-gradient-to-br from-white to-primary-subtle/20">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Mahasiswa</p>
          <p className="text-3xl md:text-4xl font-extrabold text-primary">{(buyers.length * 0.75).toFixed(0)}</p>
          <p className="text-xs text-text-muted font-bold mt-1.5">75% Populasi</p>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-extrabold text-text-primary">Daftar Akun</p>
          <p className="text-xs font-semibold text-text-muted">Menampilkan {filteredBuyers.length}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
             <div className="h-16 bg-sidebar animate-pulse rounded-2xl" />
             <div className="h-16 bg-sidebar animate-pulse rounded-2xl" />
          </div>
        ) : filteredBuyers.length > 0 ? (
          <div className="space-y-3">
            {filteredBuyers.map((buyer) => (
              <BuyerCard key={buyer.id} buyer={buyer} onView={setSelectedBuyer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted bg-white rounded-3xl border border-border-subtle shadow-card">
            <Search size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm font-bold">Tidak ada hasil ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
