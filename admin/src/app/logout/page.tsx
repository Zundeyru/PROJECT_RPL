"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // Hapus sesi pengguna
    try {
      localStorage.removeItem("umm_active_user");
    } catch (e) {
      console.error(e);
    }
    
    // Ambil origin asli saat user login
    const origin = localStorage.getItem("umm_login_origin");
    const fallbackUrl = "http://127.0.0.1:5500/index.html";
    
    // Alihkan kembali ke halaman index
    window.location.replace(origin ? origin : fallbackUrl);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-text-muted">Keluar dari sistem...</p>
      </div>
    </div>
  );
}
