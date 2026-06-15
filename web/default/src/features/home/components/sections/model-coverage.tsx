/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
        { name: 'GPT-4o', category: t('Flagship') },
        { name: 'o3 / o4-mini', category: t('Reasoning') },
        { name: 'GPT-4.1', category: t('Latest') },
        { name: 'DALL·E 3 · Sora', category: t('Image / Video') },
      ],
      description: t(
        'The most widely used AI platform — ideal for writing, coding, and multimodal tasks.'
      ),
    },
    {
      name: 'Anthropic',
      plan: 'Claude Pro',
      models: [
        { name: 'Claude Opus 4', category: t('Most capable') },
        { name: 'Claude Sonnet 4.6', category: t('Balanced') },
        { name: 'Claude Haiku 4.5', category: t('Fast') },
      ],
      description: t(
        'Exceptional at nuanced reasoning, long documents, and safety-focused tasks.'
      ),
    },
    {
      name: 'Google',
      plan: 'Gemini Advanced',
      models: [
        { name: 'Gemini 2.5 Pro', category: t('Flagship') },
        { name: 'Gemini 2.0 Flash', category: t('Fast') },
        { name: 'NotebookLM Plus', category: t('Research') },
      ],
      description: t(
        'Deep integration with Google Search and a 1M-token context window for large-scale research.'
      ),
    },
  ]

  const otherProviders = ['Perplexity', 'Midjourney', 'Grok / xAI']

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-4xl'>

        {/* Header */}
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <p className='mb-3 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
            {t('What we support')}
          </p>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t("The world's leading AI,")}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('ready to use.')}
            </span>
          </h2>
          <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground'>
            {t(
              'We source and manage official subscriptions to the most capable AI models. Choose what you need — or mix and match.'
            )}
          </p>
        </AnimateInView>

        {/* Provider grid */}
        <AnimateInView animation='fade-up' delay={100}>
          <div className='overflow-hidden rounded-xl border border-border'>
            <div className='grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0'>
              {providers.map((provider) => (
                <ProviderCard key={provider.name} {...provider} />
              ))}
            </div>
          </div>
        </AnimateInView>

        {/* Other providers row */}
        <AnimateInView
          className='mt-6 flex flex-wrap items-center gap-2 justify-center'
          animation='fade-up'
          delay={200}
        >
          <span className='text-xs text-muted-foreground'>
            {t('Need other providers?')}
          </span>
          {otherProviders.map((p) => (
            <span
              key={p}
              className='rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground/70'
            >
              {p}
            </span>
          ))}
          <a
            href='mailto:support@quantumnous.com'
            className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors'
          >
            {t('Contact us →')}
          </a>
        </AnimateInView>
      </div>
    </section>
  )
}
