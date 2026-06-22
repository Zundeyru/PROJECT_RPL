"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const u = searchParams.get("u");
    const fromParam = searchParams.get("from");
    
    if (u) {
      try {
        const decoded = decodeURIComponent(escape(atob(u)));
        localStorage.setItem("umm_active_user", decoded);
        
        if (fromParam) {
          localStorage.setItem("umm_login_origin", decodeURIComponent(fromParam));
        }
        
        // Remove param from URL without refreshing the page
        router.replace("/");
        setTimeout(() => setIsReady(true), 100);
        return;
      } catch (e) {
        console.error("Failed to decode user param", e);
      }
    }

    // Check existing login
    const activeUser = localStorage.getItem("umm_active_user");
    if (!activeUser) {
      // If no user found and no URL param, bounce to main login page
      const origin = localStorage.getItem("umm_login_origin");
      const fallbackUrl = "http://127.0.0.1:5500/index.html";
      window.location.href = origin || fallbackUrl;
      return;
    }

    setIsReady(true);
  }, [searchParams, router]);

  if (!isReady) return null; // Or a loading spinner

  return <>{children}</>;
}
