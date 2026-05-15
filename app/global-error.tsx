"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Global error boundary for the root layout.
 *
 * IMPORTANT: Strings in this file CANNOT be translated.
 * This global error boundary renders outside the root layout and has no access
 * to providers (including next-intl). This is a Next.js limitation for
 * catastrophic error handling. These English strings only appear during
 * critical failures when the entire app crashes.
 *
 * The component must render its own <html> and <body> tags as it replaces
 * the root layout entirely.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f0fdf8" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "9999px",
                background: "hsl(158 64% 52% / 0.12)",
                border: "1px solid hsl(158 64% 52% / 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <AlertTriangle style={{ width: 40, height: 40, color: "hsl(158 64% 48%)" }} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0 1.25rem",
                height: "2.75rem",
                borderRadius: "0.75rem",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, hsl(158 64% 48%), hsl(142 76% 36%))",
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
