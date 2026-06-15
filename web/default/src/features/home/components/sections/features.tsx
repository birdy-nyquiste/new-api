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
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  Wifi,
  CreditCard,
  Zap,
  Lock,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { AnimateInView } from '@/components/animate-in-view'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()

  const features = [
    {
      id: 'pain-points',
      num: '01',
      title: t('Solve Your Core Pain Points'),
      desc: t(
        'No need to hassle with overseas accounts, subscription payments, phone verification, or network setups. Start using global mainstream AI tools with a single payment.'
      ),
      span: 'md:col-span-3',
      icon: <ShieldCheck className='text-success size-4' />,
      visual: (
        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='border-destructive/15 bg-destructive/5 min-w-0 rounded-lg border p-4'>
            <div className='text-destructive mb-3 flex items-center gap-1.5 text-xs font-bold'>
              <XCircle className='size-4 shrink-0' />
              <span className='min-w-0 break-words'>
                {t('Traditional complex setup')}
              </span>
            </div>
            <ul className='text-muted-foreground flex flex-col gap-2 text-xs'>
              <li className='flex min-w-0 items-start gap-2'>
                <span className='bg-destructive mt-1.5 size-1.5 shrink-0 rounded-full' />
                <span className='min-w-0 break-words'>
                  {t('Register overseas email accounts')}
                </span>
              </li>
              <li className='flex min-w-0 items-start gap-2'>
                <span className='bg-destructive mt-1.5 size-1.5 shrink-0 rounded-full' />
                <span className='min-w-0 break-words'>
                  {t('Foreign credit cards & phone verification')}
                </span>
              </li>
              <li className='flex min-w-0 items-start gap-2'>
                <span className='bg-destructive mt-1.5 size-1.5 shrink-0 rounded-full' />
                <span className='min-w-0 break-words'>
                  {t('Unstable, risky network routes')}
                </span>
              </li>
            </ul>
          </div>
          <div className='border-success/20 bg-success/5 min-w-0 rounded-lg border p-4'>
            <div className='text-success mb-3 flex items-center gap-1.5 text-xs font-bold'>
              <CheckCircle2 className='size-4 shrink-0' />
              <span className='min-w-0 break-words'>
                  {t('Nyquiste Router AI Suite solution')}
              </span>
            </div>
            <ul className='text-muted-foreground flex flex-col gap-2 text-xs'>
              <li className='text-foreground flex min-w-0 items-start gap-2 font-medium'>
                <span className='bg-success mt-1.5 size-1.5 shrink-0 rounded-full' />
                <span className='min-w-0 break-words'>
                  {t('Single subscription, instant activation')}
                </span>
              </li>
              <li className='text-foreground flex min-w-0 items-start gap-2 font-medium'>
                <span className='bg-success mt-1.5 size-1.5 shrink-0 rounded-full' />
                <span className='min-w-0 break-words'>
                  {t('Compliant and secure network routing')}
                </span>
              </li>
              <li className='text-foreground flex min-w-0 items-start gap-2 font-medium'>
                <span className='bg-success mt-1.5 size-1.5 shrink-0 rounded-full' />
                <span className='min-w-0 break-words'>
                  {t('Pre-configured global AI models')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'global-models',
      num: '02',
      title: t('Covering Global Mainstream AI Vendors'),
      desc: t(
        'OpenAI (ChatGPT), Anthropic (Claude), Google (Gemini), and other global AI services configured on demand.'
      ),
      span: 'md:col-span-1',
      icon: <Cpu className='text-info size-4' />,
      visual: (
        <div className='mt-4 flex flex-col gap-2'>
          {[
            { name: 'OpenAI ChatGPT', label: 'GPT-4o / O3-Mini' },
            { name: 'Anthropic Claude', label: 'Claude 3.5 Sonnet' },
            { name: 'Google Gemini', label: 'Gemini 2.0 Flash' },
          ].map((item) => (
            <div
              key={item.name}
              className='border-border/40 bg-muted/20 flex min-w-0 flex-col gap-1 rounded-lg border px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between'
            >
              <span className='text-foreground min-w-0 font-medium break-words'>
                {item.name}
              </span>
              <span className='text-muted-foreground min-w-0 text-[10px] break-words'>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'enterprise-sub',
      num: '03',
      title: t('Enterprise-Grade Annual Subscription'),
      desc: t(
        'Safe, stable, and compliant service. Flexible configuration of Plus, Pro, or Max subscriptions and quotas.'
      ),
      span: 'md:col-span-1',
      icon: <CreditCard className='text-primary size-4' />,
      visual: (
        <div className='mt-4 flex flex-col gap-1.5'>
          {['Plus', 'Pro', 'Max'].map((tier) => (
            <div
              key={tier}
              className={cn(
                'flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-1.5 text-xs',
                tier === 'Pro'
                  ? 'border-primary/30 bg-primary/5 text-primary font-semibold'
                  : 'border-border/40 bg-muted/10 text-muted-foreground'
              )}
            >
              <span className='min-w-0 break-words'>
                {tier} {t('Plan')}
              </span>
              {tier === 'Pro' && (
                <span className='shrink-0 text-[10px]'>{t('Recommended')}</span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'sim-traffic',
      num: '04',
      title: t('SIM Card Global Traffic'),
      desc: t(
        'Compliant and stable international network connectivity powered by China Telecom (Hong Kong). Pay-as-you-go.'
      ),
      span: 'md:col-span-1',
      icon: <Wifi className='text-warning size-4' />,
      visual: (
        <div className='border-info/20 bg-info/5 mt-4 min-w-0 rounded-lg border p-3'>
          <div className='text-info flex items-center justify-between gap-3 text-[11px] font-bold'>
            <span className='min-w-0 break-words'>
              {t('China Telecom (Hong Kong)')}
            </span>
            <Wifi className='size-3.5 shrink-0 motion-safe:animate-pulse' />
          </div>
          <p className='text-muted-foreground mt-1.5 text-[10px] leading-relaxed break-words'>
            {t(
              'Compliant and stable international network. Pay-as-you-go cellular traffic.'
            )}
          </p>
        </div>
      ),
    },
  ]

  const additionalFeatures = [
    {
      icon: <Lock className='size-5' strokeWidth={1.5} />,
      title: t('Compliant Route'),
      desc: t(
        'Stable access through compliant international network channels'
      ),
    },
    {
      icon: <Zap className='size-5' strokeWidth={1.5} />,
      title: t('Annual Subscription'),
      desc: t(
        'One annual plan keeps premium AI accounts configured and ready to use'
      ),
    },
    {
      icon: <Sparkles className='size-5' strokeWidth={1.5} />,
      title: t('Continuous Updates'),
      desc: t(
        'Instant access to newly released global models as soon as they deploy'
      ),
    },
  ]

  return (
    <section className='relative z-10 px-6 pt-10 pb-24 md:pt-12 md:pb-32'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 max-w-lg'>
          <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
            {t('Core capabilities')}
          </p>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
            {t('Global AI configuration')}
            <br />
            {t('tailored for Chinese users')}
          </h2>
        </AnimateInView>

        {/* Bento grid */}
        <div className='border-border/40 bg-border/40 grid gap-px overflow-hidden rounded-xl border md:grid-cols-3'>
          {features.map((f, i) => (
            <AnimateInView
              key={f.id}
              delay={i * 100}
              animation='scale-in'
              className={cn(
                'group bg-background hover:bg-muted/20 min-w-0 p-7 transition-colors duration-300 md:p-8',
                f.span
              )}
            >
              <div className='mb-3 flex min-w-0 items-start gap-3'>
                <span className='border-border/40 bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold tabular-nums'>
                  {f.num}
                </span>
                <h3 className='flex min-w-0 items-start gap-2 text-sm font-semibold break-words'>
                  {f.icon}
                  <span className='min-w-0'>{f.title}</span>
                </h3>
              </div>
              <p className='text-muted-foreground text-sm leading-relaxed break-words'>
                {f.desc}
              </p>
              {f.visual}
            </AnimateInView>
          ))}
        </div>

        {/* Additional features row */}
        <div className='mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-12'>
          {additionalFeatures.map((f, i) => (
            <AnimateInView
              key={f.title}
              delay={i * 100}
              animation='fade-up'
              className='flex min-w-0 flex-col items-center text-center'
            >
              <div className='text-muted-foreground border-border/50 bg-muted/30 group-hover:text-foreground mb-3 flex size-12 items-center justify-center rounded-xl border transition-colors'>
                {f.icon}
              </div>
              <h3 className='mb-1.5 text-sm font-semibold break-words'>
                {f.title}
              </h3>
              <p className='text-muted-foreground max-w-[200px] text-xs leading-relaxed break-words'>
                {f.desc}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
