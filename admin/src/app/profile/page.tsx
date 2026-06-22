"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { api } from "@/services/api";

interface FormData {
  name: string;
  bio: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
}

const INITIAL: FormData = {
  name: "Memuat...",
  bio: "Admin Utama",
  gender: "-",
  birthDate: "-",
  phone: "-",
  email: "-",
};

function mask(value: string, type: "phone" | "email") {
  if (type === "phone") return value.replace(/.(?=.{4})/g, "•");
  const [local, domain] = value.split("@");
  return local.slice(0, 2) + "•".repeat(local.length - 2) + "@" + domain;
}

function Field({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  maskedValue,
}: {
  label: string;
  name: string;
  value: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  maskedValue?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <label className="text-sm font-semibold text-text-muted w-2/5 pt-0.5 flex-shrink-0">{label}</label>
      {isEditing ? (
        name === "gender" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-3/5 px-3 py-2 border border-border rounded-xl bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-3/5 px-3 py-2 border border-border rounded-xl bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          />
        )
      ) : (
        <p className="w-3/5 text-sm font-semibold text-text-primary text-right">
          {maskedValue ?? value}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [toast, setToast] = useState(false);

  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("umm_active_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setAdminId(u.id);
        setFormData({
          name: u.name || "",
          bio: "Admin Utama",
          gender: u.gender || "",
          birthDate: u.birthDate || "",
          phone: u.phone || "",
          email: u.email || "",
        });
      } catch(e) {}
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) return;
    
    try {
      await api.updateUserProfile(adminId, {
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate,
        phone: formData.phone,
        email: formData.email
      });

      // Update localStorage
      const userStr = localStorage.getItem("umm_active_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const updated = { ...u, ...formData };
        localStorage.setItem("umm_active_user", JSON.stringify(updated));
      }

      setIsEditing(false);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan profil admin.");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Avatar Hero */}
      <Card className="flex flex-col items-center py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4 shadow-[0_4px_16px_rgba(140,90,53,0.3)]">
          <span className="text-white font-extrabold text-2xl">
            {formData.name !== "Memuat..." ? formData.name.substring(0,2).toUpperCase() : "AD"}
          </span>
        </div>
        <p className="text-xl font-extrabold text-text-primary">{formData.name}</p>
        <p className="text-sm text-text-muted font-medium mt-0.5">{formData.bio} · Admin</p>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-[0_4px_12px_rgba(140,90,53,0.3)]"
          >
            Edit Profil
          </button>
        )}
      </Card>

      {/* Form */}
      <form onSubmit={handleSave}>
        <Card>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Informasi Dasar</p>
          <div className="divide-y divide-border-subtle">
            <Field label="Nama" name="name" value={formData.name} isEditing={isEditing} onChange={handleChange} />
            <Field label="Bio" name="bio" value={formData.bio} isEditing={isEditing} onChange={handleChange} />
          </div>
        </Card>

        <div className="mt-4">
          <Card>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Informasi Pribadi</p>
            <div className="divide-y divide-border-subtle">
              <Field label="Jenis Kelamin" name="gender" value={formData.gender} isEditing={isEditing} onChange={handleChange} />
              <Field label="Tanggal Lahir" name="birthDate" value={formData.birthDate} isEditing={isEditing} onChange={handleChange} />
            </div>
          </Card>
        </div>

        <div className="mt-4">
          <Card>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Kontak</p>
            <div className="divide-y divide-border-subtle">
              <Field
                label="Nomor HP"
                name="phone"
                value={formData.phone}
                isEditing={isEditing}
                onChange={handleChange}
                maskedValue={isEditing ? undefined : mask(formData.phone, "phone")}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                isEditing={isEditing}
                onChange={handleChange}
                maskedValue={isEditing ? undefined : mask(formData.email, "email")}
              />
            </div>
          </Card>
        </div>

        {isEditing && (
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-[0_4px_16px_rgba(140,90,53,0.3)]"
            >
              Simpan Perubahan
            </button>
            <button
              type="button"
              onClick={() => { setIsEditing(false); setFormData(INITIAL); }}
              className="w-full py-3.5 border border-border text-text-secondary font-semibold rounded-2xl hover:bg-sidebar transition-colors text-sm"
            >
              Batal
            </button>
          </div>
        )}
      </form>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full shadow-xl z-50 animate-toast">
          ✓ Profil berhasil diperbarui
        </div>
      )}
    </div>
  );
}
