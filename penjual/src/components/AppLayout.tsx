"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Menu, Bell } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeName, setStoreName] = useState("Loading...");
  const pathname = usePathname();

  useEffect(() => {
    // Decode and save user data from URL if coming from login page
    const params = new URLSearchParams(window.location.search);
    const uParam = params.get("u");
    if (uParam) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(escape(atob(uParam))));
        localStorage.setItem("umm_active_user", JSON.stringify(decodedUser));
      } catch (e) {
        console.error("Failed to decode user from URL", e);
      }
    }

    // Save origin URL if passed via query params
    const fromParam = params.get("from");
    if (fromParam) {
      localStorage.setItem("umm_login_origin", decodeURIComponent(fromParam));
      // Remove query params to clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check authentication
    const userStr = localStorage.getItem("umm_active_user");
    if (!userStr) {
      const fallbackUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://127.0.0.1:5500/index.html";
      const origin = localStorage.getItem("umm_login_origin");
      window.location.href = origin || fallbackUrl;
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "seller") {
        throw new Error("Not a seller");
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStoreName(user.storeName || user.name || "Toko Saya");
    } catch {
      const fallbackUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://127.0.0.1:5500/index.html";
      window.location.href = fallbackUrl;
      return;
    }

    setIsLoading(false);
  }, []);

  // System Notification for New Orders
  const [storeId, setStoreId] = useState<string | null>(null);
  const [notifiedOrderIds, setNotifiedOrderIds] = useState<string[]>([]);
  
  useEffect(() => {
    const userStr = localStorage.getItem("umm_active_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // We need to fetch storeId to listen to orders
        import('@/services/api').then(({ api }) => {
          api.getStoreBySeller(user.id).then((data: any) => {
            if (data) setStoreId(data.id);
          });
        });
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!storeId) return;

    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const urlB64ToUint8Array = (base64String: string) => {
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding)
                  .replace(/\-/g, '+')
                  .replace(/_/g, '/');
                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; ++i) {
                  outputArray[i] = rawData.charCodeAt(i);
                }
                return outputArray;
              };

              const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
              if (vapidKey) {
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlB64ToUint8Array(vapidKey)
                });
              }
            }
          }
          
          if (subscription) {
            // Save subscription to the store in Supabase
            const { api } = await import('@/services/api');
            await api.updateStorePushSubscription(storeId, JSON.parse(JSON.stringify(subscription)));
          }

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();

  }, [storeId]);

  const pageTitles: Record<string, string> = {
    "/": "Kelola Menu",
    "/pesanan": "Kelola Pesanan",
    "/peforma": "Peforma Toko",
    "/profile": "Profile",
  };

  const title = Object.entries(pageTitles)
    .filter(([p]) => pathname === p || (p !== "/" && pathname.startsWith(p)))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Dashboard Penjual";

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-brand text-white shadow-md z-30 sticky top-0">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 -ml-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu size={28} />
            </button>
            <h1 className="text-xl font-bold tracking-wide absolute left-1/2 -translate-x-1/2">
              {title}
            </h1>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white border-b border-sidebar-border px-8 py-5 items-center justify-between z-20 shadow-sm sticky top-0">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
            <p className="text-sm text-text-muted mt-0.5">Kelola toko Anda dengan mudah</p>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative p-2.5 rounded-xl bg-surface-hover text-brand hover:bg-brand hover:text-white transition-colors duration-200 group">
              <Bell size={20} className="stroke-[2.5]" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-white group-hover:border-brand" />
            </button>
            <div className="h-10 w-px bg-sidebar-border" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-text-primary leading-tight">{storeName}</span>
                <span className="text-xs font-medium text-brand">Penjual</span>
              </div>
              <div className="w-11 h-11 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-brand-light">
                {storeName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
