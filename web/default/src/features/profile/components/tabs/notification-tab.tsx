/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUserSettings } from '../../api'
import { DEFAULT_QUOTA_WARNING_THRESHOLD } from '../../constants'
import { parseUserSettings } from '../../lib'
import type { UserProfile, UserSettings } from '../../types'

// ============================================================================
// Settings Tab Component
// ============================================================================

interface NotificationTabProps {
  profile: UserProfile | null
  onUpdate: () => void
}

export function NotificationTab({ profile, onUpdate }: NotificationTabProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    notify_type: 'email',
    quota_warning_threshold: DEFAULT_QUOTA_WARNING_THRESHOLD,
    notification_email: '',
    webhook_url: '',
    webhook_secret: '',
    bark_url: '',
    gotify_url: '',
    gotify_token: '',
    gotify_priority: 5,
    accept_unset_model_ratio_model: false,
    record_ip_log: false,
    upstream_model_update_notify_enabled: false,
  })

  // Update form field helper
  const updateField = useCallback(
    <K extends keyof UserSettings>(field: K, value: UserSettings[K]) => {
      setSettings((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  useEffect(() => {
    if (profile?.setting) {
      const parsed = parseUserSettings(profile.setting)
      setSettings({
        notify_type: 'email',
        quota_warning_threshold:
          parsed.quota_warning_threshold ?? DEFAULT_QUOTA_WARNING_THRESHOLD,
        notification_email: parsed.notification_email ?? '',
        webhook_url: parsed.webhook_url ?? '',
        webhook_secret: parsed.webhook_secret ?? '',
        bark_url: parsed.bark_url ?? '',
        gotify_url: parsed.gotify_url ?? '',
        gotify_token: parsed.gotify_token ?? '',
        gotify_priority: parsed.gotify_priority ?? 5,
        accept_unset_model_ratio_model:
          parsed.accept_unset_model_ratio_model || false,
        record_ip_log: parsed.record_ip_log || false,
        upstream_model_update_notify_enabled:
          parsed.upstream_model_update_notify_enabled || false,
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await updateUserSettings({
        ...settings,
        notify_type: 'email',
      })

      if (response.success) {
        toast.success(t('Settings updated successfully'))
        onUpdate()
      } else {
        toast.error(response.message || t('Failed to update settings'))
      }
    } catch (_error) {
      toast.error(t('Failed to update settings'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Warning Threshold */}
      <div className='space-y-1.5'>
        <Label htmlFor='threshold'>{t('Quota Warning Threshold')}</Label>
        <Input
          id='threshold'
          type='number'
          className='h-9'
          value={settings.quota_warning_threshold}
          onChange={(e) =>
            updateField('quota_warning_threshold', Number(e.target.value))
          }
          placeholder={t('Enter threshold')}
        />
        <p className='text-muted-foreground text-xs'>
          {t('Get notified when balance falls below this value')}
        </p>
      </div>

      {/* Email Settings */}
      <div className='space-y-1.5'>
        <Label htmlFor='notifyEmail'>{t('Notification Email')}</Label>
        <Input
          id='notifyEmail'
          type='email'
          className='h-9'
          value={settings.notification_email}
          onChange={(e) => updateField('notification_email', e.target.value)}
          placeholder={t('Leave empty to use account email')}
        />
        <p className='text-muted-foreground text-xs'>
          {t('Email is the only notification method available.')}
        </p>
      </div>

      {/* Save Button */}
      <div className='flex justify-end'>
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {loading ? t('Saving...') : t('Save Settings')}
        </Button>
      </div>
    </div>
  )
}
