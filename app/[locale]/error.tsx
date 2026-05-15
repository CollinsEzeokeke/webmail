"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { AuroraBlobs, NexaBadge } from "@/components/ui/aurora-shell";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const router = useRouter();

  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="login-page-bg min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AuroraBlobs />

      <div className="relative z-10 text-center max-w-md px-4">
        <NexaBadge className="mb-6" />

        <div
          className="w-16 h-16 mx-auto mt-2 mb-5 rounded-full flex items-center justify-center"
          style={{ background: "hsl(158 64% 52% / 0.12)", border: "1px solid hsl(158 64% 52% / 0.25)" }}
        >
          <AlertCircle className="w-8 h-8" style={{ color: "var(--login-primary)" }} />
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t("page_error_title")}
        </h2>
        <p className="text-muted-foreground mb-8">
          {t("page_error_description")}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-medium border border-border/60 bg-muted/40 text-foreground hover:bg-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            {t("go_home")}
          </button>
          <button
            onClick={reset}
            className="login-btn-primary inline-flex items-center justify-center gap-2 px-5 h-10 rounded-xl text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            {t("try_again")}
          </button>
        </div>
      </div>
    </div>
  );
}
