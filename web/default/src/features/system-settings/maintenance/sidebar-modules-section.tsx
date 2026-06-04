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
  SettingsControlChildren,
  SettingsForm,
  SettingsSwitchContent,
  SettingsControlGroup,
  SettingsSwitchItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'
import {
  SIDEBAR_MODULES_DEFAULT,
  type SidebarModulesAdminConfig,
  serializeSidebarModulesAdmin,
} from './config'

type SidebarModulesSectionProps = {
  config: SidebarModulesAdminConfig
  initialSerialized: string
}

type SidebarFormValues = SidebarModulesAdminConfig

const toTitleCase = (value: string) =>
  value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

export function SidebarModulesSection({
  config,
  initialSerialized,
}: SidebarModulesSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const sectionMeta: Record<string, { title: string; description: string }> = {
    chat: {
      title: t('Chat'),
      description: t('Playground experiments and live conversations.'),
    },
    console: {
      title: t('General'),
      description: t('Dashboards, keys, and usage analytics.'),
    },
    personal: {
      title: t('Personal'),
      description: t('Wallet management and personal preferences.'),
    },
    admin: {
      title: t('Admin'),
      description: t('Global configuration and administrative tools.'),
    },
  }

  const moduleMeta: Record<
    string,
    Record<string, { title: string; description: string }>
  > = {
    chat: {
      playground: {
        title: t('Playground'),
        description: t('Experiment with prompts and models in real time.'),
      },
      modelCompare: {
        title: t('Model Compare'),
        description: t('Compare models side by side.'),
      },
      chat: {
        title: t('Chat'),
        description: t('Access previous conversations and start new ones.'),
      },
    },
    console: {
      overview: {
        title: t('Overview'),
        description: t('Getting started and account overview.'),
      },
      dashboard: {
        title: t('Dashboard'),
        description: t('Aggregated usage metrics and trend charts.'),
      },
      token: {
        title: t('API Keys'),
        description: t('Create, revoke, and audit API keys.'),
      },
      log: {
        title: t('Usage Logs'),
        description: t('Detailed request logs for investigations.'),
      },
      midjourney: {
        title: t('Drawing Logs'),
        description: t('History of Midjourney-style image tasks.'),
      },
      task: {
        title: t('Task Logs'),
        description: t('Background job tracker for queued work.'),
      },
    },
    personal: {
      topup: {
        title: t('Wallet'),
        description: t('Top up balance and view billing history.'),
      },
      personal: {
        title: t('Profile'),
        description: t('Personal settings and profile management.'),
      },
    },
    admin: {
      channel: {
        title: t('Channels'),
        description: t('Configure upstream providers and routing.'),
      },
      models: {
        title: t('Models'),
        description: t('Manage catalog visibility and pricing.'),
      },
      redemption: {
        title: t('Redemption Codes'),
        description: t('Create and review invite or credit codes.'),
      },
      user: {
        title: t('Users'),
        description: t('Administer user accounts and roles.'),
      },
      setting: {
        title: t('System Settings'),
        description: t('Advanced platform configuration.'),
      },
      subscription: {
        title: t('Subscription Management'),
        description: t('Manage subscription plans and pricing.'),
      },
    },
  }

  // Card-level (third tier) metadata, keyed by card key.
  const cardMeta: Record<string, { title: string; description: string }> = {
    // Overview page cards
    setupGuide: {
      title: t('Setup guide'),
      description: t('Get started steps and recommended actions.'),
    },
    performanceHealth: {
      title: t('Performance health'),
      description: t('System performance metrics (admin only).'),
    },
    uptime: {
      title: t('Uptime'),
      description: t('Service uptime and status panel.'),
    },
    apiInfo: {
      title: t('API Info'),
      description: t('API endpoint and connection details.'),
    },
    announcements: {
      title: t('Announcements'),
      description: t('System announcements panel.'),
    },
    faq: {
      title: t('FAQ'),
      description: t('Frequently asked questions panel.'),
    },
    // Wallet page cards
    referral: {
      title: t('Referral Program'),
      description: t('Affiliate and referral rewards card.'),
    },
    // Profile page cards
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

  const form = useForm<SidebarFormValues>({
    defaultValues: formDefaults,
  })

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const onSubmit = async (values: SidebarFormValues) => {
    const serialized = serializeSidebarModulesAdmin(values)
    if (serialized === initialSerialized) {
      return
    }

    await updateOption.mutateAsync({
      key: 'SidebarModulesAdmin',
      value: serialized,
    })
  }

  const resetToDefault = () => {
    form.reset(SIDEBAR_MODULES_DEFAULT)
  }

  const sections = Object.entries(config)

  return (
    <SettingsSection title={t('Sidebar modules')}>
      <Form {...form}>
        <SettingsForm onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsPageFormActions
            onSave={form.handleSubmit(onSubmit)}
            onReset={resetToDefault}
            isSaving={updateOption.isPending}
            resetLabel='Reset to default'
            saveLabel='Save sidebar modules'
          />
          {sections.map(([sectionKey, sectionConfig]) => {
            const sectionInfo = sectionMeta[sectionKey] ?? {
              title: toTitleCase(sectionKey),
              description: t('Custom sidebar section'),
            }
            const modules = Object.entries(sectionConfig).filter(
              ([moduleKey]) => moduleKey !== 'enabled'
            )

            return (
              <SettingsControlGroup key={sectionKey}>
                <FormField
                  control={form.control}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  name={`${sectionKey}.enabled` as any}
                  render={({ field }) => (
                    <SettingsSwitchItem>
                      <SettingsSwitchContent>
                        <FormLabel>{sectionInfo.title}</FormLabel>
                        <FormDescription>
                          {sectionInfo.description}
                        </FormDescription>
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

                <SettingsControlChildren className='grid gap-3 md:grid-cols-2'>
                  {modules.map(([moduleKey, moduleValue]) => {
                    const moduleInfo = moduleMeta[sectionKey]?.[moduleKey] ?? {
                      title: toTitleCase(moduleKey),
                      description: t('Custom module'),
                    }
                    // Object nodes bind their on/off state to `<module>.enabled`;
                    // simple boolean modules bind directly to `<module>`.
                    const isCardBearing =
                      moduleValue !== null && typeof moduleValue === 'object'
                    const fieldName = isCardBearing
                      ? `${sectionKey}.${moduleKey}.enabled`
                      : `${sectionKey}.${moduleKey}`
                    return (
                      <FormField
                        key={`${sectionKey}.${moduleKey}`}
                        control={form.control}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        name={fieldName as any}
                        render={({ field }) => (
                          <SettingsSwitchItem className='border-b-0 py-2'>
                            <SettingsSwitchContent>
                              <FormLabel>{moduleInfo.title}</FormLabel>
                              <FormDescription>
                                {moduleInfo.description}
                              </FormDescription>
                            </SettingsSwitchContent>
                            <FormControl>
                              <Switch
                                checked={Boolean(field.value)}
                                onCheckedChange={field.onChange}
                                disabled={
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  !form.watch(`${sectionKey}.enabled` as any)
                                }
                              />
                            </FormControl>
                          </SettingsSwitchItem>
                        )}
                      />
                    )
                  })}
                </SettingsControlChildren>

                {modules.map(([moduleKey, moduleValue]) => {
                  if (moduleValue === null || typeof moduleValue !== 'object') {
                    return null
                  }
                  const cardKeys = Object.keys(moduleValue.cards ?? {})
                  if (cardKeys.length === 0) return null
                  const moduleInfo = moduleMeta[sectionKey]?.[moduleKey] ?? {
                    title: toTitleCase(moduleKey),
                    description: t('Custom module'),
                  }
                  const sectionOff =
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    !form.watch(`${sectionKey}.enabled` as any)
                  const moduleOff =
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    !form.watch(`${sectionKey}.${moduleKey}.enabled` as any)
                  return (
                    <div
                      key={`cards-${sectionKey}-${moduleKey}`}
                      className='border-primary/40 bg-background/70 mt-4 rounded-lg border border-l-4 p-3 shadow-xs'
                    >
                      <div className='mb-3 flex items-center gap-2 border-b pb-2'>
                        <span
                          className='bg-primary/70 h-4 w-1 rounded-full'
                          aria-hidden='true'
                        />
                        <FormLabel className='text-foreground text-xs font-semibold tracking-wide uppercase'>
                          {t('{{module}} cards', { module: moduleInfo.title })}
                        </FormLabel>
                      </div>
                      <div className='grid gap-3 md:grid-cols-2'>
                        {cardKeys.map((cardKey) => {
                          const cardInfo = cardMeta[cardKey] ?? {
                            title: toTitleCase(cardKey),
                            description: t('Custom card'),
                          }
                          return (
                            <FormField
                              key={`${sectionKey}.${moduleKey}.cards.${cardKey}`}
                              control={form.control}
                              name={
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                `${sectionKey}.${moduleKey}.cards.${cardKey}` as any
                              }
                              render={({ field }) => (
                                <SettingsSwitchItem className='border-b-0 py-2'>
                                  <SettingsSwitchContent>
                                    <FormLabel>{cardInfo.title}</FormLabel>
                                    <FormDescription>
                                      {cardInfo.description}
                                    </FormDescription>
                                  </SettingsSwitchContent>
                                  <FormControl>
                                    <Switch
                                      checked={Boolean(field.value)}
                                      onCheckedChange={field.onChange}
                                      disabled={sectionOff || moduleOff}
                                    />
                                  </FormControl>
                                </SettingsSwitchItem>
                              )}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </SettingsControlGroup>
            )
          })}
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
