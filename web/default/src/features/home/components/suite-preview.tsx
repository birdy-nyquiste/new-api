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
import { useState } from 'react'
import {
  Cpu,
  Wifi,
  CreditCard,
  Globe,
  CheckCircle2,
  Database,
  ArrowUpRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

interface SuitePreviewProps {
  className?: string
}

type SuitePreviewTab = 'models' | 'network' | 'subscription'

export function SuitePreview(props: SuitePreviewProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<SuitePreviewTab>('models')

  const tabs: {
    id: SuitePreviewTab
    label: string
    icon: typeof Cpu
  }[] = [
    { id: 'models', label: t('Global Models'), icon: Cpu },
    { id: 'network', label: t('Global Traffic'), icon: Wifi },
    { id: 'subscription', label: t('Plan Subscription'), icon: CreditCard },
  ]

  const connectedModels = [
    {
      name: 'OpenAI - ChatGPT',
      desc: 'GPT-5.5 Pro / GPT-5.5 / GPT-5.4',
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20',
    },
    {
      name: 'Anthropic - Claude',
      desc: 'Claude Fable 5 / Opus 4.8 / Sonnet 4.6',
      color: 'text-orange-500 bg-orange-500/5 border-orange-500/20',
    },
    {
      name: 'Google - Gemini',
      desc: 'Gemini 3.5 Pro / Gemini 3.5 Flash / Veo 3.1',
      color: 'text-blue-500 bg-blue-500/5 border-blue-500/20',
    },
  ]

  const subscribedAccounts = [
    {
      icon: 'OpenAI.Color',
      account: 'ChatGPT account',
      plan: 'ChatGPT Pro',
      models: 'GPT-5.5 Pro / GPT-5.5 / GPT-5.4',
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20',
    },
    {
      icon: 'Claude.Color',
      account: 'Claude account',
      plan: 'Claude Max 5x',
      models: 'Fable 5 / Opus 4.8 / Sonnet 4.6',
      color: 'text-orange-500 bg-orange-500/5 border-orange-500/20',
    },
    {
      icon: 'Gemini.Color',
      account: 'Gemini account',
      plan: 'Google AI Ultra 5x',
      models: 'Gemini 3.5 Pro / Gemini 3.5 Flash / Veo 3.1',
      color: 'text-blue-500 bg-blue-500/5 border-blue-500/20',
    },
  ]

  return (
    <div
      className={cn(
        'border-border/40 bg-card/60 w-full max-w-lg min-w-0 rounded-2xl border p-4 shadow-2xl backdrop-blur-md select-none sm:p-6',
        props.className
      )}
    >
      {/* Tabs */}
      <div
        className='bg-muted/40 mb-5 grid grid-cols-1 gap-1 rounded-lg p-1 sm:grid-cols-3'
        role='tablist'
        aria-label={t('Global AI configuration')}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type='button'
              role='tab'
              aria-selected={isActive}
              aria-controls={`suite-preview-${tab.id}`}
              id={`suite-preview-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'focus-visible:ring-ring flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none sm:min-h-9',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/20 hover:text-foreground'
              )}
            >
              <Icon className='size-3.5 shrink-0' />
              <span className='min-w-0 text-center leading-tight break-words'>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content area */}
      <div className='flex min-h-[27rem] min-w-0 flex-col justify-between sm:min-h-[15.5rem]'>
        {activeTab === 'models' && (
          <div
            id='suite-preview-models'
            role='tabpanel'
            aria-labelledby='suite-preview-tab-models'
            className='motion-safe:animate-fade-in flex min-w-0 flex-col gap-4'
          >
            <div className='text-muted-foreground flex min-w-0 flex-wrap items-center justify-between gap-2 text-xs'>
              <span className='min-w-0 break-words'>
                {t('Mainstream AI Models Connected')}
              </span>
            </div>

            {/* Model entries */}
            {connectedModels.map((model) => (
              <div
                key={model.name}
                className={cn(
                  'flex min-w-0 flex-col gap-3 rounded-xl border p-3 transition-all duration-300 hover:translate-x-1 motion-reduce:hover:translate-x-0 sm:flex-row sm:items-center sm:justify-between',
                  model.color
                )}
              >
                <div className='flex min-w-0 items-start gap-3'>
                  <div className='border-border bg-background flex size-8 shrink-0 items-center justify-center rounded-lg border'>
                    <Cpu className='text-foreground/80 size-4' />
                  </div>
                  <div className='min-w-0'>
                    <div className='text-foreground text-xs font-bold break-words'>
                      {model.name}
                    </div>
                    <div className='text-muted-foreground mt-0.5 text-[10px] break-words'>
                      {model.desc}
                    </div>
                  </div>
                </div>
                <div className='shrink-0 text-left sm:text-right'>
                  <div className='text-success flex items-center gap-1.5 text-[11px] font-medium sm:justify-end'>
                    <CheckCircle2 className='size-3 shrink-0' />
                    {t('Ready')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'network' && (
          <div
            id='suite-preview-network'
            role='tabpanel'
            aria-labelledby='suite-preview-tab-network'
            className='motion-safe:animate-fade-in flex min-w-0 flex-col gap-4'
          >
            <div className='text-muted-foreground text-xs break-words'>
              {t('Global Cellular Data connection')}
            </div>

            {/* SIM Card Graphic */}
            <div className='border-border via-background relative overflow-hidden rounded-xl border bg-gradient-to-br from-violet-500/10 to-blue-500/10 p-4'>
              <div className='absolute -top-12 -right-12 size-36 rounded-full bg-violet-500/5 blur-2xl' />
              <div className='absolute -bottom-12 -left-12 size-36 rounded-full bg-blue-500/5 blur-2xl' />

              <div className='relative flex min-w-0 flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='text-muted-foreground text-[11px] tracking-widest uppercase'>
                    {t('Mobile Operator')}
                  </div>
                  <div className='text-foreground mt-0.5 text-sm font-bold break-words'>
                    {t('China Telecom (Hong Kong)')}
                  </div>
                </div>
                <div className='bg-primary/10 text-primary flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold'>
                  <Globe className='size-3 motion-safe:animate-pulse' />
                  {t('Compliant Route')}
                </div>
              </div>

              <div className='border-border/30 relative mt-5 grid grid-cols-1 gap-4 border-t pt-3 sm:grid-cols-2'>
                <div className='min-w-0'>
                  <div className='text-muted-foreground text-[10px]'>
                    {t('Network Status')}
                  </div>
                  <div className='text-foreground mt-0.5 flex min-w-0 items-center gap-1.5 text-xs font-bold'>
                    <Wifi className='text-success size-3.5 shrink-0' />
                    <span className='min-w-0 break-words'>
                      {t('Stable Connection')}
                    </span>
                  </div>
                </div>
                <div className='min-w-0'>
                  <div className='text-muted-foreground text-[10px]'>
                    {t('Billing Method')}
                  </div>
                  <div className='text-foreground mt-0.5 text-xs font-bold break-words'>
                    {t('Pay-As-You-Go')}
                  </div>
                </div>
              </div>
            </div>

            <div className='border-border/60 bg-muted/10 text-muted-foreground flex min-w-0 items-center justify-between gap-3 rounded-lg border border-dashed p-3 text-xs'>
              <div className='flex min-w-0 items-center gap-2'>
                <Database className='text-primary size-4 shrink-0' />
                <span className='min-w-0 break-words'>
                  {t('Compliant and stable international network')}
                </span>
              </div>
              <ArrowUpRight className='size-3.5 shrink-0' />
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div
            id='suite-preview-subscription'
            role='tabpanel'
            aria-labelledby='suite-preview-tab-subscription'
            className='motion-safe:animate-fade-in flex min-w-0 flex-col gap-4'
          >
            <div className='text-muted-foreground text-xs break-words'>
              {t('Subscribed accounts')}
            </div>

            <div className='flex min-w-0 flex-col gap-2.5'>
              {subscribedAccounts.map((account) => (
                <div
                  key={account.account}
                  className={cn(
                    'flex min-w-0 items-center gap-3 rounded-xl border p-2.5',
                    account.color
                  )}
                >
                  <div className='border-border bg-background flex size-8 shrink-0 items-center justify-center rounded-lg border'>
                    {getLobeIcon(account.icon, 18)}
                  </div>
                  <div className='grid min-w-0 flex-1 grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto]'>
                    <div className='min-w-0'>
                      <div className='flex min-w-0 items-center gap-2'>
                        <div className='text-foreground min-w-0 text-xs font-bold break-words'>
                          {account.account}
                        </div>
                        <span className='text-success bg-success/10 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold'>
                          {t('Active')}
                        </span>
                      </div>
                      <div className='text-muted-foreground mt-0.5 text-[10px] break-words'>
                        {account.models}
                      </div>
                    </div>
                    <div className='bg-background/70 text-foreground min-w-0 rounded-md border border-current/10 px-2 py-1 text-[10px] font-semibold break-words sm:max-w-28 sm:text-right'>
                      {account.plan}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
