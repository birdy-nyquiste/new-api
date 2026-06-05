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
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
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

  // Tracks which card-bearing tabs have their level-3 dropdown expanded.
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({})

  const sectionMeta: Record<string, { title: string; description: string }> = {
    chat: {
      title: t('Chat'),
      description: t('Model Lab experiments and live conversations.'),
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
        title: t('Model Lab'),
        description: t('Experiment with prompts and models in real time.'),
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

                <SettingsControlChildren className='space-y-2'>
                  {modules.map(([moduleKey, moduleValue]) => {
                    const moduleInfo = moduleMeta[sectionKey]?.[moduleKey] ?? {
                      title: toTitleCase(moduleKey),
                      description: t('Custom module'),
                    }
                    const isCardBearing =
                      moduleValue !== null && typeof moduleValue === 'object'
                    const cardKeys = isCardBearing
                      ? Object.keys(
                          (moduleValue as { cards?: Record<string, boolean> })
                            .cards ?? {}
                        )
                      : []
                    const hasCards = cardKeys.length > 0
                    const sectionOff =
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      !form.watch(`${sectionKey}.enabled` as any)

                    // Simple tab (no level-3 cards) — plain toggle row.
                    if (!hasCards) {
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
                            <SettingsSwitchItem className='border-b-0 px-3 py-2'>
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
                                  disabled={sectionOff}
                                />
                              </FormControl>
                            </SettingsSwitchItem>
                          )}
                        />
                      )
                    }

                    // Card-bearing tab — toggle row plus a collapsible dropdown
                    // that reveals its level-3 cards.
                    const tabKey = `${sectionKey}.${moduleKey}`
                    const moduleOff =
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      !form.watch(`${tabKey}.enabled` as any)
                    const open = expandedTabs[tabKey] ?? false
                    return (
                      <div
                        key={tabKey}
                        className='bg-background/60 overflow-hidden rounded-lg border'
                      >
                        <div className='flex items-center justify-between gap-2 px-3 py-2'>
                          <button
                            type='button'
                            aria-expanded={open}
                            onClick={() =>
                              setExpandedTabs((prev) => ({
                                ...prev,
                                [tabKey]: !open,
                              }))
                            }
                            className='-m-1 flex flex-1 items-center gap-2 rounded-md p-1 text-left'
                          >
                            <ChevronRight
                              className={cn(
                                'text-muted-foreground size-4 shrink-0 transition-transform',
                                open && 'rotate-90'
                              )}
                              aria-hidden='true'
                            />
                            <span className='flex min-w-0 flex-col gap-0.5'>
                              <span className='text-sm leading-none font-medium'>
                                {moduleInfo.title}
                              </span>
                              <span className='text-muted-foreground text-xs'>
                                {moduleInfo.description}
                              </span>
                            </span>
                            <span className='bg-muted text-muted-foreground ml-1 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium'>
                              {t('{{total}} cards', { total: cardKeys.length })}
                            </span>
                          </button>
                          <FormField
                            control={form.control}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            name={`${tabKey}.enabled` as any}
                            render={({ field }) => (
                              <FormControl>
                                <Switch
                                  checked={Boolean(field.value)}
                                  onCheckedChange={field.onChange}
                                  disabled={sectionOff}
                                />
                              </FormControl>
                            )}
                          />
                        </div>
                        {open && (
                          <div className='bg-muted/20 grid gap-3 border-t px-3 py-3 md:grid-cols-2'>
                            {cardKeys.map((cardKey) => {
                              const cardInfo = cardMeta[cardKey] ?? {
                                title: toTitleCase(cardKey),
                                description: t('Custom card'),
                              }
                              return (
                                <FormField
                                  key={`${tabKey}.cards.${cardKey}`}
                                  control={form.control}
                                  name={
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    `${tabKey}.cards.${cardKey}` as any
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
                        )}
                      </div>
                    )
                  })}
                </SettingsControlChildren>
              </SettingsControlGroup>
            )
          })}
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
