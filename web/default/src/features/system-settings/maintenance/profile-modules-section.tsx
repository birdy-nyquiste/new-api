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
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import {
  SettingsForm,
  SettingsSwitchContent,
  SettingsControlGroup,
  SettingsSwitchItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'
import {
  PROFILE_MODULES_DEFAULT,
  type ProfileModulesAdminConfig,
  serializeProfileModulesAdmin,
} from './config'

type ProfileModulesSectionProps = {
  config: ProfileModulesAdminConfig
  initialSerialized: string
}

export function ProfileModulesSection({
  config,
  initialSerialized,
}: ProfileModulesSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const moduleMeta: Record<string, { title: string; description: string }> = {
    notifications: {
      title: t('Notifications'),
      description: t('Email notification settings in the Profile page.'),
    },
    language: {
      title: t('Language Preferences'),
      description: t('Interface language selector in the Profile page.'),
    },
    security: {
      title: t('Security'),
      description: t('Access token, password, and account deletion actions.'),
    },
    checkin: {
      title: t('Check-in'),
      description: t('Daily check-in card when check-in is enabled.'),
    },
    passkey: {
      title: t('Passkey Login'),
      description: t('Passkey management card in the Profile page.'),
    },
    twoFactor: {
      title: t('Two-Factor Authentication'),
      description: t('Two-factor authentication management card.'),
    },
    accountBindings: {
      title: t('Account Bindings'),
      description: t('Email and third-party account binding controls.'),
    },
    sidebarSettings: {
      title: t('Sidebar Personal Settings'),
      description: t('User sidebar visibility preferences card.'),
    },
  }

  const formDefaults = useMemo(() => config, [config])
  const form = useForm<ProfileModulesAdminConfig>({
    defaultValues: formDefaults,
  })

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const onSubmit = async (values: ProfileModulesAdminConfig) => {
    const serialized = serializeProfileModulesAdmin(values)
    if (serialized === initialSerialized) return

    await updateOption.mutateAsync({
      key: 'ProfileModulesAdmin',
      value: serialized,
    })
  }

  const resetToDefault = () => {
    form.reset(PROFILE_MODULES_DEFAULT)
  }

  return (
    <SettingsSection title={t('Profile modules')}>
      <Form {...form}>
        <SettingsForm onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsPageFormActions
            onSave={form.handleSubmit(onSubmit)}
            onReset={resetToDefault}
            isSaving={updateOption.isPending}
            resetLabel='Reset to default'
            saveLabel='Save profile modules'
          />

          <SettingsControlGroup>
            {Object.entries(moduleMeta).map(([key, info]) => (
              <FormField
                key={key}
                control={form.control}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name={key as any}
                render={({ field }) => (
                  <SettingsSwitchItem>
                    <SettingsSwitchContent>
                      <FormLabel>{info.title}</FormLabel>
                      <FormDescription>{info.description}</FormDescription>
                    </SettingsSwitchContent>
                    <FormControl>
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </SettingsSwitchItem>
                )}
              />
            ))}
          </SettingsControlGroup>
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
