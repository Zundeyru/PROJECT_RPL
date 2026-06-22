"use client";

import React, { useState, useEffect } from "react";
import { UserCircle2, HelpCircle, ChevronRight, ArrowLeft, Store, Save, StoreIcon, Edit2, X } from "lucide-react";
import { useSellerStore } from '@/hooks/useApi';
import { api } from '@/services/api';

export default function Profile() {
  const [view, setView] = useState<"menu" | "detail" | "toko">("menu");
  const [formData, setFormData] = useState({ name: "", location: "", coverImage: "" });
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [user, setUser] = useState<any>({
    name: "Memuat...",
    nim: "-",
    phone: "-",
    email: "-",
    gender: "-",
    birthDate: "-"
  });
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    birthDate: ""
  });
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("umm_active_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setSellerId(u.id);
        setUser(u);
        setUserForm({
          name: u.name || "",
          phone: u.phone || "",
          email: u.email || "",
          gender: u.gender || "",
          birthDate: u.birthDate || ""
        });
      } catch (e) {}
    }
  }, []);

  const { store, isLoading, setStore } = useSellerStore(sellerId);

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        location: store.location || "",
        coverImage: store.coverImage || ""
      });
    }
  }, [store]);

  const toggleStoreStatus = async () => {
    if (!store) return;
    const newStatus = !store.isOpen;
    // Optimistic update
    setStore({ ...store, isOpen: newStatus });
    try {
      await api.updateStore(store.id, { isOpen: newStatus });
    } catch (e) {
      // Revert if failed
      setStore({ ...store, isOpen: store.isOpen });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStore = async () => {
    if (!store) return;
    try {
      const finalData = {
        ...formData,
        coverImage: formData.coverImage || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"
      };
      await api.updateStore(store.id, finalData);
      setStore({ ...store, ...finalData });
      setView("menu");
      alert("Profil toko berhasil diperbarui!");
    } catch (e) {
      alert("Gagal memperbarui toko");
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    try {
      await api.updateUser(sellerId, userForm);
      const updatedUser = { ...user, ...userForm };
      setUser(updatedUser);
      localStorage.setItem("umm_active_user", JSON.stringify(updatedUser));
      setIsEditingUser(false);
      alert("Profil pribadi berhasil diperbarui!");
    } catch (err: any) {
      alert("Gagal menyimpan profil: " + err.message);
    }
  };

  if (view === "detail") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
        <button 
          onClick={() => setView("menu")}
          className="flex items-center gap-2 text-brand font-bold hover:bg-brand-light px-3 py-2 rounded-xl transition-colors -ml-3"
        >
          <ArrowLeft size={20} className="stroke-[3]" /> Kembali
        </button>

        <div className="bg-surface rounded-3xl shadow-sm border border-sidebar-border overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border bg-background/50">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Informasi Pribadi</h2>
              <p className="text-sm text-text-muted mt-1">Detail profil dan toko Anda.</p>
            </div>
            {!isEditingUser && (
              <button 
                onClick={() => setIsEditingUser(true)}
                className="p-2 hover:bg-brand-light rounded-lg transition-colors text-brand"
              >
                <Edit2 size={20} />
              </button>
            )}
          </div>
          
          {isEditingUser ? (
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={userForm.name} 
                  onChange={e => setUserForm({...userForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-sidebar-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-sm font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">No Handphone</label>
                  <input 
                    type="tel" 
                    value={userForm.phone} 
                    onChange={e => setUserForm({...userForm, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sidebar-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={userForm.email} 
                    onChange={e => setUserForm({...userForm, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sidebar-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Jenis Kelamin</label>
                  <select
                    value={userForm.gender}
                    onChange={e => setUserForm({...userForm, gender: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sidebar-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-sm font-medium"
                  >
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Tgl Lahir</label>
                  <input 
                    type="date" 
                    value={userForm.birthDate} 
                    onChange={e => setUserForm({...userForm, birthDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sidebar-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-sidebar-border mt-6">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Simpan Profil
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditingUser(false)}
                  className="px-4 py-3 border border-sidebar-border rounded-xl font-bold text-text-secondary hover:bg-sidebar-border/50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="p-0 divide-y divide-sidebar-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-background/50 transition-colors">
                <span className="font-bold text-text-secondary mb-1 sm:mb-0 w-1/3">Nama</span>
                <span className="font-semibold text-text-primary text-right flex-1">{user.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-background/50 transition-colors">
                <span className="font-bold text-text-secondary mb-1 sm:mb-0 w-1/3">Bio</span>
                <span className="font-semibold text-text-primary text-right flex-1">Owner</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-background/50 transition-colors">
                <span className="font-bold text-text-secondary mb-1 sm:mb-0 w-1/3">Jenis Kelamin</span>
                <span className="font-semibold text-text-primary text-right flex-1">{user.gender || "-"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-background/50 transition-colors">
                <span className="font-bold text-text-secondary mb-1 sm:mb-0 w-1/3">Tanggal Lahir</span>
                <span className="font-semibold text-text-primary text-right flex-1">{user.birthDate || "-"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-background/50 transition-colors">
                <span className="font-bold text-text-secondary mb-1 sm:mb-0 w-1/3">Nomor Handphone</span>
                <span className="font-semibold text-text-primary text-right flex-1">{user.phone || "-"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-background/50 transition-colors">
                <span className="font-bold text-text-secondary mb-1 sm:mb-0 w-1/3">Email</span>
                <span className="font-semibold text-text-primary text-right flex-1">{user.email || "-"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "toko") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
        <button 
          onClick={() => setView("menu")}
          className="flex items-center gap-2 text-brand font-bold hover:bg-brand-light px-3 py-2 rounded-xl transition-colors -ml-3"
        >
          <ArrowLeft size={20} className="stroke-[3]" /> Kembali
        </button>

        <div className="bg-surface rounded-3xl shadow-sm border border-sidebar-border overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-sidebar-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Pengaturan Toko</h2>
              <p className="text-sm text-text-muted mt-1">Atur profil dan status operasional toko Anda.</p>
            </div>
          </div>

          {!store ? (
            <div className="text-center py-8 text-text-muted">Toko tidak ditemukan.</div>
          ) : (
            <>
              {/* Sakelar Buka Tutup */}
              <div className="flex items-center justify-between bg-brand/5 p-4 rounded-2xl border border-brand/20">
                <div>
                  <h3 className="font-bold text-text-primary">Status Operasional</h3>
                  <p className="text-sm text-text-muted">{store.isOpen ? "Toko sedang Buka" : "Toko sedang Tutup"}</p>
                </div>
                <div onClick={toggleStoreStatus} className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors shadow-inner ${store.isOpen ? 'bg-success' : 'bg-danger'}`}>
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${store.isOpen ? 'left-8' : 'left-1'}`} />
                </div>
              </div>

              {/* Form Edit */}
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Nama Toko</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-brand/30 outline-none text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Lokasi Stand</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:ring-2 focus:ring-brand/30 outline-none text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Foto Cover Toko</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-sidebar-border border-dashed rounded-xl flex items-center justify-center text-brand hover:bg-brand-light transition-colors cursor-pointer overflow-hidden relative group"
                  >
                    {formData.coverImage ? (
                      <>
                        <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold flex items-center gap-2"><StoreIcon size={20} /> Ganti Foto</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <StoreIcon size={32} />
                        <span className="font-bold text-sm">Unggah Foto Cover</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveStore}
                className="w-full py-4 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> Simpan Perubahan
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-text-primary px-2">Pusat Akun</h2>
      
      <div className="space-y-3">
        <button 
          onClick={() => setView("detail")}
          className="w-full bg-surface p-5 rounded-2xl shadow-sm border border-sidebar-border flex items-center justify-between hover:bg-brand-light hover:border-brand/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <UserCircle2 size={24} className="stroke-[2]" />
            </div>
            <span className="font-bold text-lg text-text-primary">Profil Saya</span>
          </div>
          <ChevronRight className="text-text-muted group-hover:text-brand transition-colors" />
        </button>

        <button 
          onClick={() => setView("toko")}
          className="w-full bg-surface p-5 rounded-2xl shadow-sm border border-sidebar-border flex items-center justify-between hover:bg-brand-light hover:border-brand/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <StoreIcon size={24} className="stroke-[2]" />
            </div>
            <span className="font-bold text-lg text-text-primary">Pengaturan Toko</span>
          </div>
          <ChevronRight className="text-text-muted group-hover:text-brand transition-colors" />
        </button>

        <button 
          className="w-full bg-surface p-5 rounded-2xl shadow-sm border border-sidebar-border flex items-center justify-between hover:bg-brand-light hover:border-brand/30 transition-all group"
          onClick={() => alert("Halaman Bantuan")}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <HelpCircle size={24} className="stroke-[2]" />
            </div>
            <span className="font-bold text-lg text-text-primary">Bantuan</span>
          </div>
          <ChevronRight className="text-text-muted group-hover:text-brand transition-colors" />
        </button>
      </div>
    </div>
  );
}
