"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Store, FileText, User, LogOut, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const MENU_ITEMS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/pembeli", label: "Pembeli", icon: Users },
  { href: "/penjual", label: "Penjual", icon: Store },
  { href: "/laporan", label: "Laporan", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();

  // Overlay class for mobile
  const overlayClass = isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";
  // Sidebar translation for mobile
  const sidebarClass = isOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {/* ── Mobile Backdrop ── */}
      <div
        className={`fixed inset-0 bg-text-primary/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${overlayClass}`}
        onClick={onClose}
      />

      {/* ── Sidebar Container ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none lg:static lg:translate-x-0 lg:flex ${sidebarClass}`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
        >
          <X size={20} className="stroke-[2.5]" />
        </button>

        {/* Header / Brand */}
        <div className="pt-10 pb-8 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-card">
            <span className="text-white font-extrabold text-2xl">EK</span>
          </div>
          <h2 className="text-xl font-bold text-sidebar-text">E-Kantin UMM</h2>
          <p className="text-sm font-medium text-text-muted mt-1">Admin Dashboard</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-primary"
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? "stroke-[2.5]" : "stroke-[2.5] group-hover:scale-110"
                  }`}
                />
                <span className="text-base tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border mt-auto pb-8 lg:pb-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-4 px-4 py-3.5 rounded-xl font-bold text-white bg-danger hover:bg-danger/90 transition-all duration-200 shadow-card hover:shadow-card-hover group cursor-pointer relative z-50"
          >
            <LogOut size={22} className="stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="text-base tracking-wide">LOGOUT</span>
          </button>
        </div>
      </aside>
    </>
  );
}
