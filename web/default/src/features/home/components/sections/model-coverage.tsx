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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'
import { ProviderCard } from '../provider-card'

export function ModelCoverage() {
  const { t } = useTranslation()

  const providers = [
    {
      provider: 'OpenAI',
      plan: 'ChatGPT Plus / Pro',
      models: [
        { name: 'GPT-5.5' },
        { name: 'GPT-5.5 Pro' },
        { name: 'GPT-5.4' },
      ],
    },
    {
      provider: 'Anthropic',
      plan: 'Claude Pro / Max',
      models: [
        { name: 'Claude Fable 5' },
        { name: 'Claude Opus 4.8' },
        { name: 'Claude Sonnet 4.6' },
      ],
    },
    {
      provider: 'Google',
      plan: 'AI Pro / Ultra',
      models: [
        { name: 'Gemini 3.5 Pro' },
        { name: 'Gemini 3.5 Flash' },
        { name: 'Gemini 3.1 Flash' },
      ],
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('Account subscriptions,')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('configured on demand')}
            </span>
          </h2>
        </AnimateInView>

        <AnimateInView animation='fade-up' delay={100}>
          <div className='overflow-hidden rounded-xl border border-border'>
            <div className='grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0'>
              {providers.map((provider) => (
                <ProviderCard key={provider.provider} {...provider} />
              ))}
            </div>
          </div>
        </AnimateInView>

        <AnimateInView
          className='mt-8 flex flex-col items-center gap-4'
          animation='fade-up'
          delay={200}
        >
          <Button
            className='min-h-[48px] rounded-lg px-5 text-sm'
            render={<Link to='/plan-config' />}
          >
            {t('Configure the full bundle')}
          </Button>
          <div className='flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground'>
            <span>{t('Need more overseas AI services?')}</span>
            <a
              href='mailto:r@nyquiste.com'
              className='inline-flex min-h-[40px] items-center rounded-full border border-border/70 bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted/40 hover:text-primary'
            >
              {t('Contact us')}
            </a>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
