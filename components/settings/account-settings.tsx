"use client";

import { useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useEmailStore } from '@/stores/email-store';
import { useAccountStore } from '@/stores/account-store';
import { useContactStore } from '@/stores/contact-store';
import { SettingsSection, SettingItem } from './settings-section';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/account-utils';
import { formatFileSize } from '@/lib/utils';
import type { IJMAPClient } from '@/lib/jmap/client-interface';
import type { ContactCard } from '@/lib/jmap/types';

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas unavailable')); return; }
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function syncPhotoToServer(
  client: IJMAPClient,
  contacts: ContactCard[],
  email: string,
  displayName: string | undefined,
  dataUri: string,
) {
  const lowerEmail = email.toLowerCase();
  const selfContact = contacts.find(
    (c) => c.emails && Object.values(c.emails).some((e) => e.address.toLowerCase() === lowerEmail)
  );

  const photoMedia = { kind: 'photo' as const, uri: dataUri, mediaType: 'image/jpeg' };

  if (selfContact) {
    await client.updateContact(selfContact.originalId || selfContact.id, {
      media: { ...selfContact.media, profile: photoMedia },
    });
    return { ...selfContact, media: { ...selfContact.media, profile: photoMedia } };
  }

  // No self-contact yet — create one
  const created = await client.createContact({
    name: displayName ? { full: displayName } : undefined,
    emails: { primary: { address: email } },
    media: { profile: photoMedia },
  });
  return created;
}

async function removePhotoFromServer(
  client: IJMAPClient,
  contacts: ContactCard[],
  email: string,
) {
  const lowerEmail = email.toLowerCase();
  const selfContact = contacts.find(
    (c) => c.emails && Object.values(c.emails).some((e) => e.address.toLowerCase() === lowerEmail)
  );
  if (!selfContact) return;

  // Build updated media without the profile photo key
  const { profile: _removed, ...remainingMedia } = selfContact.media ?? {};
  await client.updateContact(selfContact.originalId || selfContact.id, {
    media: remainingMedia,
  });
  return { ...selfContact, media: remainingMedia };
}

export function AccountSettings() {
  const t = useTranslations('settings.account');
  const { username, serverUrl, isDemoMode, primaryIdentity, authMode, activeAccountId, client } = useAuthStore();
  const { quota } = useEmailStore();
  const account = useAccountStore((s) => activeAccountId ? s.getAccountById(activeAccountId) : undefined);
  const updateAccount = useAccountStore((s) => s.updateAccount);
  const { contacts, updateLocalContact, addLocalContact } = useContactStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const quotaPercentage = quota ? Math.round((quota.used / quota.total) * 100) : 0;
  const displayName = primaryIdentity?.name || account?.displayName || (isDemoMode ? 'Demo User' : undefined);
  const email = primaryIdentity?.email || account?.email || username;

  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAccountId || !email) return;
    e.target.value = '';
    setIsUploading(true);
    setPhotoError(null);
    try {
      const dataUri = await compressImage(file);

      // Save to account store immediately so account-switcher updates
      updateAccount(activeAccountId, { profilePhotoUri: dataUri });

      // Sync to Stalwart via JMAP contacts if available
      if (client?.supportsContacts()) {
        const updated = await syncPhotoToServer(client, contacts, email, displayName, dataUri);
        // Keep local contact store in sync
        if (contacts.some((c) => c.id === updated.id)) {
          updateLocalContact(updated.id, updated);
        } else {
          addLocalContact(updated);
        }
      }
    } catch {
      setPhotoError('Failed to save photo. Please try again.');
      // Roll back account store if server sync failed
      if (client?.supportsContacts()) {
        updateAccount(activeAccountId, { profilePhotoUri: undefined });
      }
    } finally {
      setIsUploading(false);
    }
  }, [activeAccountId, email, displayName, client, contacts, updateAccount, updateLocalContact, addLocalContact]);

  const handleRemovePhoto = useCallback(async () => {
    if (!activeAccountId || !email) return;
    setIsUploading(true);
    setPhotoError(null);
    try {
      updateAccount(activeAccountId, { profilePhotoUri: undefined });
      if (client?.supportsContacts()) {
        const updated = await removePhotoFromServer(client, contacts, email);
        if (updated) updateLocalContact(updated.id, updated);
      }
    } catch {
      setPhotoError('Failed to remove photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [activeAccountId, email, client, contacts, updateAccount, updateLocalContact]);

  return (
    <SettingsSection title={t('title')} description={t('description')}>
      {/* Profile Photo */}
      <SettingItem label={t('profile_photo.label')} description={t('profile_photo.description')}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {account?.profilePhotoUri ? (
              <img
                src={account.profilePhotoUri}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: account?.avatarColor || '#888' }}
              >
                {getInitials(displayName || '', email || '')}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                )}
                {account?.profilePhotoUri ? t('profile_photo.change') : t('profile_photo.upload')}
              </Button>
              {account?.profilePhotoUri && !isUploading && (
                <Button size="sm" variant="outline" onClick={handleRemovePhoto}>
                  <X className="w-3.5 h-3.5" />
                  <span className="sr-only">{t('profile_photo.remove')}</span>
                </Button>
              )}
            </div>
            {photoError && (
              <p className="text-xs text-destructive">{photoError}</p>
            )}
            {client?.supportsContacts() && !photoError && (
              <p className="text-xs text-muted-foreground">
                {isUploading ? 'Saving to server…' : 'Synced to your JMAP server'}
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </SettingItem>

      {/* Display Name */}
      <SettingItem label={t('name_label')}>
        <span className="text-sm text-foreground">{displayName || t('../../common.unknown')}</span>
      </SettingItem>

      {/* Email Address */}
      <SettingItem label={t('email.label')}>
        <span className="text-sm text-foreground">{email || t('../../common.unknown')}</span>
      </SettingItem>

      {/* Username / Login (show when it differs from email) */}
      {username && username !== email && (
        <SettingItem label={t('username_label')}>
          <span className="text-sm text-foreground">{username}</span>
        </SettingItem>
      )}

      {/* Authentication Method */}
      <SettingItem label={t('auth_method_label')}>
        <span className="text-sm text-foreground">
          {authMode === 'oauth' ? t('auth_method_oauth') : t('auth_method_basic')}
        </span>
      </SettingItem>

      {/* Server */}
      <SettingItem label={t('server.label')}>
        <span className="text-sm text-foreground truncate max-w-xs">
          {serverUrl || t('../../common.unknown')}
        </span>
      </SettingItem>

      {/* Storage */}
      {quota && quota.total > 0 && (
        <SettingItem
          label={t('storage.label')}
          description={t('storage.used', {
            used: formatFileSize(quota.used),
            total: formatFileSize(quota.total),
          })}
        >
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-foreground">
              {t('storage.percentage', { percent: quotaPercentage })}
            </span>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
          </div>
        </SettingItem>
      )}

      {/* Demo mode indicator */}
      {isDemoMode && (
        <SettingItem label={t('account_type_label')}>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {t('demo_account')}
          </span>
        </SettingItem>
      )}
    </SettingsSection>
  );
}
