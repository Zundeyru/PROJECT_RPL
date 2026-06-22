"use client";

import { Home, ClipboardList, BarChart3, User, LogOut, X, Utensils } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [logoutUrl, setLogoutUrl] = useState("http://127.0.0.1:5500/index.html");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogoutUrl(localStorage.getItem("umm_login_origin") || "http://127.0.0.1:5500/index.html");
  }, []);

  const menuItems = [
    { name: "Kelola Menu", icon: <Home size={24} />, path: "/" },
    { name: "Kelola Pesanan", icon: <ClipboardList size={24} />, path: "/pesanan" },
    { name: "Peforma Toko", icon: <BarChart3 size={24} />, path: "/peforma" },
    { name: "Profile", icon: <User size={24} />, path: "/profile" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("umm_active_user");
    if (logoutUrl && !logoutUrl.startsWith("file://")) {
      window.location.href = logoutUrl;
    } else {
      alert("Logout Berhasil! Karena Anda membuka file index.html secara lokal, browser tidak mengizinkan kembali secara otomatis. Silakan tutup tab ini dan buka kembali file index.html.");
      window.location.href = "about:blank";
    }
  };

  // Mobile overlay class
  const overlayClass = isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";
  // Sidebar mobile translate class
  const sidebarClass = isOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {/* ── Mobile Backdrop ── */}
      <div
        className={`fixed inset-0 bg-text-primary/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${overlayClass}`}
        onClick={onClose}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none lg:static lg:translate-x-0 lg:flex ${sidebarClass}`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-md">
              <Utensils size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-brand leading-tight">E-Kantin</h1>
              <p className="text-xs font-semibold text-brand/70 uppercase tracking-wider">Penjual</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-brand hover:bg-brand-hover/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "text-brand hover:bg-sidebar-hover hover:text-brand-hover"
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </div>
                <span className="text-base tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-sidebar-border mt-auto pb-8 lg:pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-4 px-4 py-3.5 rounded-xl font-bold text-white bg-danger hover:bg-danger/90 transition-all duration-200 shadow-md hover:shadow-lg group cursor-pointer"
          >
            <LogOut size={22} className="stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="text-base tracking-wide">LOGOUT</span>
          </button>
        </div>
      </aside>
    </>
  );
}
