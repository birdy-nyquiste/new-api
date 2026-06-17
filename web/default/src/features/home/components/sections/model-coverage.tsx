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
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { ProviderCard } from '../provider-card'

export function ModelCoverage() {
  const { t } = useTranslation()

  const providers = [
    {
      name: 'OpenAI',
      plan: 'ChatGPT Plus / Pro',
      models: [
        { name: 'GPT-5.5', category: t('Flagship') },
        { name: 'GPT-5.5 Pro', category: t('Complex tasks') },
        { name: 'GPT-5.4', category: t('Daily tasks') },
      ],
    },
    {
      name: 'Anthropic',
      plan: 'Claude Pro / Max',
      models: [
        { name: 'Claude Fable 5', category: t('Flagship') },
        { name: 'Claude Opus 4.8', category: t('Complex tasks') },
        { name: 'Claude Sonnet 4.6', category: t('Daily tasks') },
      ],
    },
    {
      name: 'Google',
      plan: 'Google AI Pro / Ultra',
      models: [
        { name: 'Gemini 3.5 Pro', category: t('Flagship') },
        { name: 'Gemini 3.5 Flash', category: t('Complex tasks') },
        { name: 'Gemini 3.1 Flash', category: t('Daily tasks') },
      ],
    },
  ]

  const otherProviders = ['Perplexity', 'Grok / xAI', 'Midjourney']

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('The global AI all-in-one suite,')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('configured around your needs.')}
            </span>
          </h2>
          <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground'>
            {t(
              'Start with ChatGPT, Claude, and Gemini. Add other overseas AI services when your workflow actually needs them.'
            )}
          </p>
        </AnimateInView>

        <AnimateInView animation='fade-up' delay={100}>
          <div className='overflow-hidden rounded-xl border border-border'>
            <div className='grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0'>
              {providers.map((provider) => (
                <ProviderCard key={provider.name} {...provider} />
              ))}
            </div>
          </div>
        </AnimateInView>

        <AnimateInView
          className='mt-6 flex flex-wrap items-center justify-center gap-2'
          animation='fade-up'
          delay={200}
        >
          <span className='text-xs text-muted-foreground'>
            {t('Need more overseas AI services?')}
          </span>
          {otherProviders.map((provider) => (
            <span
              key={provider}
              className='rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground'
            >
              {provider}
            </span>
          ))}
          <a
            href='mailto:r@nyquiste.com'
            className='inline-flex min-h-[44px] items-center rounded-full bg-primary/10 px-3.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20'
          >
            {t('Contact us')}
          </a>
        </AnimateInView>
      </div>
    </section>
  )
}
