'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useConfig } from '@/hooks/use-config';
import { useThemeStore } from '@/stores/theme-store';
import { apiFetch } from '@/lib/browser-navigation';
import { AuroraBlobs, NexaBadge } from '@/components/ui/aurora-shell';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginLogoLightUrl, loginLogoDarkUrl } = useConfig();
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const logoUrl = resolvedTheme === 'dark' ? loginLogoDarkUrl : loginLogoLightUrl;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page-bg min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AuroraBlobs />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <NexaBadge label="Admin Panel" className="mb-6" />

          <div className="relative flex items-center justify-center w-14 h-14 mb-4 animate-login-float">
            <div className="login-logo-glow-ring" />
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-9 h-9 object-contain relative z-10" />
            ) : (
              <Shield className="w-8 h-8 relative z-10" style={{ color: 'var(--login-primary)' }} />
            )}
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Enter your admin password to continue</p>
        </div>

        <div className="login-card rounded-2xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input-field w-full h-11 px-3.5 bg-muted/40 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 outline-none"
                placeholder="Enter admin password"
                required
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="login-btn-primary w-full h-11 rounded-xl font-medium text-[15px] flex items-center justify-center"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
