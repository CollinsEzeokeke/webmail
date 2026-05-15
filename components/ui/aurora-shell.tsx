"use client";

import { Shield } from "lucide-react";

export function AuroraBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="login-aurora-blob login-aurora-blob-1 absolute -top-40 -left-28 w-[580px] h-[580px]" />
      <div className="login-aurora-blob login-aurora-blob-2 absolute -bottom-40 -right-28 w-[540px] h-[540px]" />
    </div>
  );
}

export function NexaBadge({ label = "Nexa Platform", className }: { label?: string; className?: string }) {
  return (
    <div className={`login-nexa-badge${className ? ` ${className}` : ""}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--login-primary)" }} />
      <span className="text-[10px] font-semibold tracking-widest uppercase">{label}</span>
    </div>
  );
}

export function AuroraLoadingScreen({ label }: { label: string }) {
  return (
    <div
      className="login-page-bg min-h-screen flex items-center justify-center relative overflow-hidden"
      role="status"
      aria-label={label}
    >
      <AuroraBlobs />
      <div className="relative z-10 flex flex-col items-center gap-7">
        <NexaBadge />
        <div className="relative flex items-center justify-center w-16 h-16 animate-login-float">
          <div className="login-logo-glow-ring" />
          <Shield className="w-9 h-9 relative z-10" style={{ color: "var(--login-primary)" }} />
        </div>
        <div className="flex items-center gap-2.5" aria-hidden="true">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      </div>
    </div>
  );
}
