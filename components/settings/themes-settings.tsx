'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';
import { SettingsSection } from './settings-section';
import { cn } from '@/lib/utils';
import { Check, Lock } from 'lucide-react';
import { toast } from '@/stores/toast-store';
import { usePolicyStore } from '@/stores/policy-store';

const THEME_SWATCHES: Record<string, string[]> = {
  default:              ['#0d9488', '#0f766e', '#134e4a', '#99f6e4', '#f0fdfa'],
  'builtin-qui':        ['#1e40af', '#1d4ed8', '#3b82f6', '#93c5fd', '#eff6ff'],
  'builtin-nord':       ['#2e3440', '#3b4252', '#5e81ac', '#88c0d0', '#eceff4'],
  'builtin-catppuccin': ['#1e1e2e', '#313244', '#8839ef', '#cba6f7', '#eff1f5'],
  'builtin-solarized':  ['#002b36', '#073642', '#268bd2', '#b58900', '#fdf6e3'],
};

const FALLBACK_SWATCHES = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#eef2ff'];

export function ThemesSettings() {
  const { installedThemes, activeThemeId, activateTheme } = useThemeStore();
  const { isThemeDisabled, getThemePolicy, getForcedThemeId, isThemeForceEnabled } = usePolicyStore();
  const themePolicy = getThemePolicy();
  const forcedThemeId = getForcedThemeId(installedThemes.map((theme) => theme.id));

  const visibleThemes = installedThemes.filter(
    theme => !isThemeDisabled(theme.id, !!theme.builtIn)
  );

  useEffect(() => {
    if (forcedThemeId && activeThemeId !== forcedThemeId) {
      activateTheme(forcedThemeId);
    }
  }, [activeThemeId, activateTheme, forcedThemeId]);

  useEffect(() => {
    if (activeThemeId) {
      const activeTheme = installedThemes.find(t => t.id === activeThemeId);
      if (activeTheme && isThemeDisabled(activeThemeId, !!activeTheme.builtIn)) {
        activateTheme(forcedThemeId ?? null);
      }
    }
  }, [activeThemeId, activateTheme, forcedThemeId, installedThemes, isThemeDisabled]);

  const handleActivate = (id: string | null) => {
    if (forcedThemeId && id !== forcedThemeId) {
      const forcedTheme = installedThemes.find((theme) => theme.id === forcedThemeId);
      toast.info(`Theme "${forcedTheme?.name ?? 'Admin theme'}" is forced by admin and cannot be changed`);
      return;
    }
    activateTheme(id);
    toast.success(id ? 'Theme activated' : 'Default theme restored');
  };

  return (
    <SettingsSection title="Themes" description="Choose from themes deployed by your administrator and built-in presets.">

      {forcedThemeId && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
          Theme selection is locked by an administrator.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <ThemeCard
          name="Nexa Theme"
          author="Official"
          swatches={THEME_SWATCHES.default}
          isActive={activeThemeId === null}
          isBuiltIn
          isDefault={!themePolicy.defaultThemeId}
          disabled={Boolean(forcedThemeId)}
          onActivate={() => handleActivate(null)}
        />

        {visibleThemes.map(theme => {
          const isForceEnabled = theme.id === forcedThemeId || theme.forceEnabled || isThemeForceEnabled(theme.id);
          return (
            <ThemeCard
              key={theme.id}
              name={theme.name}
              author={theme.author}
              preview={theme.preview}
              swatches={THEME_SWATCHES[theme.id] ?? FALLBACK_SWATCHES}
              isActive={activeThemeId === theme.id}
              isBuiltIn={theme.builtIn}
              isDefault={themePolicy.defaultThemeId === theme.id}
              isForceEnabled={isForceEnabled}
              disabled={Boolean(forcedThemeId) && !isForceEnabled}
              variants={theme.variants}
              onActivate={() => handleActivate(theme.id)}
            />
          );
        })}
      </div>
    </SettingsSection>
  );
}

// ─── Theme Card ──────────────────────────────────────────────

interface ThemeCardProps {
  name: string;
  author: string;
  preview?: string;
  swatches: string[];
  isActive: boolean;
  isBuiltIn: boolean;
  isDefault?: boolean;
  isForceEnabled?: boolean;
  disabled?: boolean;
  variants?: ('light' | 'dark')[];
  onActivate: () => void;
}

function ThemeCard({ name, author, preview, swatches, isActive, isDefault, isForceEnabled, disabled, variants, onActivate }: ThemeCardProps) {
  return (
    <div data-search-label={name} className="relative">
      <button
        type="button"
        onClick={onActivate}
        disabled={disabled}
        className={cn(
          'group relative flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 w-full text-left disabled:cursor-not-allowed disabled:opacity-50',
          isActive
            ? 'border-primary shadow-lg shadow-primary/10'
            : 'border-border hover:border-primary/50 hover:shadow-md',
          disabled && !isActive && 'hover:border-border hover:shadow-none'
        )}
      >
        {/* Color swatch strip */}
        <div className="relative w-full h-20 flex overflow-hidden">
          {preview ? (
            <img src={preview} alt={name} className="w-full h-full object-cover" />
          ) : (
            swatches.map((color, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))
          )}

          {/* Active checkmark overlay */}
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="rounded-full bg-white/95 p-1.5 shadow-lg">
                <Check className="w-4 h-4 text-primary" strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className={cn(
          'p-3 transition-colors',
          isActive ? 'bg-primary/5' : 'bg-card group-hover:bg-muted/20'
        )}>
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <span className={cn(
              'text-sm font-semibold leading-tight truncate',
              isActive ? 'text-primary' : 'text-foreground'
            )}>
              {name}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              {isForceEnabled && (
                <span
                  title="Admin enforced"
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                >
                  <Lock className="w-2.5 h-2.5" />
                </span>
              )}
              {isDefault && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-primary/10 text-primary">
                  Default
                </span>
              )}
            </div>
          </div>

          <span className="text-xs text-muted-foreground block truncate">{author}</span>

          {variants && variants.length > 0 && (
            <div className="flex gap-1 mt-2">
              {variants.map(v => (
                <span key={v} className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-muted text-muted-foreground capitalize">
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
