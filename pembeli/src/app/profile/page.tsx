"use client";

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { User, Mail, Phone, Calendar, Key, ChevronRight, Menu, Edit2, X, Save } from 'lucide-react';
import { api } from '@/services/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>({
    name: "Pembeli",
    nim: "-",
    phone: "-",
    email: "-",
    gender: "-",
    birthDate: "-"
  });
  
  const [avatarUrl, setAvatarUrl] = useState("https://ui-avatars.com/api/?name=Pembeli&background=D2B48C&color=3E2723");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    nim: "",
    phone: "",
    email: "",
    gender: "",
    birthDate: ""
  });

  useEffect(() => {
    const activeUser = localStorage.getItem("umm_active_user");
    if (activeUser) {
      try {
        const u = JSON.parse(activeUser);
        setUser(u);
        setEditForm({
          name: u.name || "",
          nim: u.nim || "",
          phone: u.phone || "",
          email: u.email || "",
          gender: u.gender || "",
          birthDate: u.birthDate || ""
        });
        if (u.name) {
          setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=D2B48C&color=3E2723`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("umm_active_user");
    const origin = localStorage.getItem("umm_login_origin");
    if (origin && !origin.startsWith("file://")) {
      window.location.href = origin;
    } else {
      alert("Logout Berhasil! Karena Anda membuka file index.html secara lokal, browser tidak mengizinkan kembali secara otomatis. Silakan tutup tab ini dan buka kembali file index.html.");
      window.location.href = "about:blank";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Simpan ke database Supabase via api.ts
      await api.updateUser(user.id, editForm);
      
      // 2. Perbarui state lokal
      const updatedUser = { ...user, ...editForm };
      setUser(updatedUser);
      setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&background=D2B48C&color=3E2723`);
      
      // 3. Perbarui localStorage
      localStorage.setItem("umm_active_user", JSON.stringify(updatedUser));
      
      setIsEditing(false);
      alert("Profil berhasil diperbarui!");
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan profil: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-background animate-fade-in pb-24 lg:pb-8">
      <header className="lg:hidden bg-primary text-white p-4 pb-20 rounded-b-3xl shadow-card relative z-10 flex items-start justify-between">
        <button onClick={() => window.dispatchEvent(new CustomEvent('openSidebar'))} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="font-bold text-lg text-center absolute left-1/2 -translate-x-1/2">Profile</h1>
        <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <Edit2 size={20} />
        </button>
        
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden">
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 pt-16">
        <div className="text-center mb-8">
          <h2 className="font-bold text-xl text-text-primary">{user.name}</h2>
          <p className="text-sm font-medium text-text-muted mt-1">NIM: {user.nim || "-"}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Nama Lengkap</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center text-primary">
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Tanggal Lahir</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{user.birthDate || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center text-primary">
                <Phone size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Nomor Handphone</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{user.phone || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-light/20 flex items-center justify-center text-primary">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Universitas</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{user.email || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface transition-colors">
              <div className="flex items-center gap-3">
                <Key size={18} className="text-text-muted" />
                <span className="font-bold text-sm text-text-primary">Ubah Password</span>
              </div>
              <ChevronRight size={18} className="text-text-muted" />
            </button>
          </div>
          
          <button onClick={handleLogout} className="w-full bg-white border border-red-200 text-red-600 font-bold py-4 rounded-2xl shadow-sm hover:bg-red-50 transition-colors mt-6">
            Log Out
          </button>
        </div>
      </main>

      {/* Modal Edit Profil */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh] shadow-xl animate-slide-up sm:animate-zoom-in">
            <div className="flex items-center justify-between p-5 border-b border-border-subtle sticky top-0 bg-white rounded-t-3xl sm:rounded-3xl z-10">
              <h3 className="font-bold text-lg text-text-primary">Ubah Profil</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface text-text-muted hover:text-text-primary hover:bg-border-subtle transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form id="edit-profile-form" onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">NIM</label>
                    <input 
                      type="text" 
                      value={editForm.nim} 
                      onChange={e => setEditForm({...editForm, nim: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">No Handphone</label>
                    <input 
                      type="tel" 
                      value={editForm.phone} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={editForm.email} 
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Jenis Kelamin</label>
                    <select
                      value={editForm.gender}
                      onChange={e => setEditForm({...editForm, gender: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
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
                      value={editForm.birthDate} 
                      onChange={e => setEditForm({...editForm, birthDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-border-subtle bg-white rounded-b-3xl mt-auto">
              <button 
                type="submit"
                form="edit-profile-form"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold shadow-[0_4px_12px_rgba(139,90,43,0.3)] hover:shadow-[0_6px_16px_rgba(139,90,43,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
