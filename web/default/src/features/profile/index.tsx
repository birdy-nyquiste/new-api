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
import { useMemo } from 'react'
import { Link2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { TitledCard } from '@/components/ui/titled-card'
import { Main } from '@/components/layout'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { parseProfileModulesAdmin } from '@/features/system-settings/maintenance/config'
import { CheckinCalendarCard } from './components/checkin-calendar-card'
import { LanguagePreferencesCard } from './components/language-preferences-card'
import { PasskeyCard } from './components/passkey-card'
import { ProfileHeader } from './components/profile-header'
import { ProfileSecurityCard } from './components/profile-security-card'
import { ProfileSettingsCard } from './components/profile-settings-card'
import { SidebarModulesCard } from './components/sidebar-modules-card'
import { AccountBindingsTab } from './components/tabs/account-bindings-tab'
import { TwoFACard } from './components/two-fa-card'
import { useProfile } from './hooks'

export function Profile() {
  const { t } = useTranslation()
  const { profile, loading, refreshProfile } = useProfile()
  const { status } = useStatus()
  const profileModules = useMemo(
    () =>
      parseProfileModulesAdmin(
        status?.ProfileModulesAdmin as string | null | undefined
      ),
    [status?.ProfileModulesAdmin]
  )

  const checkinEnabled = status?.checkin_enabled === true
  const turnstileEnabled = !!(
    status?.turnstile_check && status?.turnstile_site_key
  )
  const turnstileSiteKey = status?.turnstile_site_key || ''

  return (
    <Main>
      <div className='min-h-0 flex-1 overflow-auto px-3 py-3 sm:px-4 sm:py-6'>
        <CardStaggerContainer className='mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6'>
          <CardStaggerItem>
            <ProfileHeader profile={profile} loading={loading} />
          </CardStaggerItem>

          <CardStaggerItem>
            <div className='space-y-4 sm:space-y-6'>
              {profileModules.checkin && checkinEnabled && (
                <CheckinCalendarCard
                  checkinEnabled={checkinEnabled}
                  turnstileEnabled={turnstileEnabled}
                  turnstileSiteKey={turnstileSiteKey}
                />
              )}
              {profileModules.notifications && (
                <ProfileSettingsCard
                  profile={profile}
                  loading={loading}
                  onProfileUpdate={refreshProfile}
                />
              )}

              {profileModules.accountBindings && (
                <TitledCard
                  title={t('Account Bindings')}
                  description={t('Manage linked sign-in methods')}
                  icon={<Link2 className='h-4 w-4' />}
                >
                  <AccountBindingsTab
                    profile={profile}
                    onUpdate={refreshProfile}
                  />
                </TitledCard>
              )}

              {profileModules.language && (
                <LanguagePreferencesCard
                  profile={profile}
                  onProfileUpdate={refreshProfile}
                />
              )}
              {profileModules.security && (
                <ProfileSecurityCard profile={profile} loading={loading} />
              )}
              {profileModules.sidebarSettings && <SidebarModulesCard />}
              {profileModules.passkey && <PasskeyCard loading={loading} />}
              {profileModules.twoFactor && <TwoFACard loading={loading} />}
            </div>
          </CardStaggerItem>
        </CardStaggerContainer>
      </div>
    </Main>
  )
}
