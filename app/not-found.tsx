"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getPathPrefix } from "@/lib/browser-navigation";
import { AuroraBlobs, NexaBadge } from "@/components/ui/aurora-shell";

export default function NotFound() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      const prefix = getPathPrefix();
      const adminBase = `${prefix}/admin`;
      const isAdminRoute = window.location.pathname === adminBase || window.location.pathname.startsWith(`${adminBase}/`);
      if (!isAdminRoute) {
        window.location.href = `${prefix}/login`;
      }
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    let isAdmin = false;
    if (typeof window !== 'undefined') {
      const prefix = getPathPrefix();
      const adminBase = `${prefix}/admin`;
      isAdmin = window.location.pathname === adminBase || window.location.pathname.startsWith(`${adminBase}/`);
    }
    if (!isAdmin) return null;
  }

  const prefix = typeof window !== 'undefined' ? getPathPrefix() : '';

  return (
    <div className="login-page-bg min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AuroraBlobs />

      <div className="relative z-10 text-center max-w-md px-4">
        <NexaBadge className="mb-6" />
        <p className="text-[96px] font-display font-bold leading-none mt-2" style={{ color: "var(--login-primary)" }}>
          404
        </p>
        <h1 className="text-xl font-semibold text-foreground mt-2 mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">This page could not be found. It may have been moved or deleted.</p>
        <a
          href={`${prefix}/`}
          className="login-btn-primary inline-flex items-center justify-center px-6 h-11 rounded-xl font-medium text-[15px]"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
