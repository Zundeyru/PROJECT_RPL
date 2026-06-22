"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/":        "Beranda",
  "/pembeli": "Kelola Pembeli",
  "/penjual": "Kelola Penjual",
  "/laporan": "Laporan Penjualan",
  "/profile": "Profile",
};

interface ActiveUser {
  username: string;
  name?: string;
  fullName?: string;
  role: string;
}

// Ambil URL halaman login utama yang tersimpan
function getLoginUrl(): string {
  return localStorage.getItem("umm_login_origin") ?? "http://127.0.0.1:5500/index.html";
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user,      setUser]      = useState<ActiveUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Cek URL param ?u=... (kiriman dari login.js lintas domain)
    const params   = new URLSearchParams(window.location.search);
    const uParam   = params.get("u");
    const fromParam = params.get("from");

    if (uParam) {
      try {
        const parsed: ActiveUser = JSON.parse(decodeURIComponent(escape(atob(uParam))));
        if (parsed.role === "admin") {
          // Simpan ke localStorage domain localhost:3000
          localStorage.setItem("umm_active_user", JSON.stringify(parsed));
          // Simpan URL login utama untuk keperluan logout
          if (fromParam) {
            localStorage.setItem("umm_login_origin", decodeURIComponent(fromParam));
          }
          // Bersihkan URL dari query param
          window.history.replaceState({}, "", "/");
          setUser(parsed);
          setIsLoading(false);
          return;
        }
      } catch { /* abaikan jika parsing gagal */ }
    }

    // 2. Cek localStorage untuk sesi yang sudah ada
    const raw = localStorage.getItem("umm_active_user");
    if (!raw) {
      // Tidak ada sesi → kembali ke halaman login utama
      window.location.href = getLoginUrl();
      return;
    }

    try {
      const parsed: ActiveUser = JSON.parse(raw);
      if (parsed.role !== "admin") {
        // Bukan admin → kembali ke login utama
        window.location.href = getLoginUrl();
        return;
      }
      setUser(parsed);
      setIsLoading(false);
    } catch {
      window.location.href = getLoginUrl();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("umm_active_user");
    const origin = localStorage.getItem("umm_login_origin");
    if (origin && !origin.startsWith("file://")) {
      window.location.href = origin;
    } else {
      alert("Logout Berhasil! Karena Anda membuka file index.html secara lokal, browser tidak mengizinkan kembali secara otomatis. Silakan tutup tab ini dan buka kembali file index.html.");
      window.location.href = "about:blank";
    }
  };

  // ── Page title ───────────────────────────────────────────────────────────────
  const title = Object.entries(pageTitles)
    .filter(([p]) => pathname === p || (p !== "/" && pathname.startsWith(p)))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Dashboard";

  const displayName = user?.name ?? user?.fullName ?? user?.username ?? "Admin";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-text-muted">Memverifikasi sesi…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-sidebar transition-colors"
          >
            <Menu size={22} className="text-text-primary stroke-[2.5]" />
          </button>
          <h1 className="text-base font-bold text-text-primary">{title}</h1>
          <div className="w-9 h-9 rounded-full bg-primary-subtle flex items-center justify-center">
            <span className="text-primary font-bold text-xs">{initials}</span>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex items-center justify-between px-10 py-5 bg-white border-b border-border z-30">
          <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary leading-tight">{displayName}</p>
              <p className="text-xs text-text-muted">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
          </div>
        </header>

        {/* Konten utama */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
