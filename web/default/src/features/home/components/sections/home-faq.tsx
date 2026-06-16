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

export function HomeFAQ() {
  const { t } = useTranslation()

  const faqs = [
    {
      q: t('Why not just use domestic AI?'),
      a: t(
        'Domestic AI is useful for many daily tasks. If you care about English work, code, long documents, complex reasoning, overseas material, or multi-model comparison, ChatGPT, Claude, and Gemini are still worth adding.'
      ),
    },
    {
      q: t('Is one ChatGPT account enough?'),
      a: t(
        'Sometimes yes. But different models have different strengths: ChatGPT is broad, Claude is strong for writing and long documents, and Gemini fits multimodal and Google ecosystem workflows.'
      ),
    },
    {
      q: t('Is this a fixed all-in-one package?'),
      a: t(
        'No. It is a custom global AI setup. You can choose one or several providers, pick subscription tiers, and decide whether SIM or eSIM traffic is needed.'
      ),
    },
    {
      q: t('Will the account always work without risk?'),
      a: t(
        'Any overseas AI service can be affected by platform policy, region rules, and usage behavior. We focus on reducing setup and usage risk, explaining usage rules, and providing necessary support.'
      ),
    },
    {
      q: t('Do Android and Huawei phones work?'),
      a: t(
        'It depends on the AI tools you choose. Web access is usually easier. App usage may involve app stores, system versions, and regional settings, so we confirm your device before delivery.'
      ),
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-4xl'>
        <AnimateInView className='mb-10'>
          <p className='mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase'>
            {t('FAQ')}
          </p>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('Questions before you configure')}
          </h2>
        </AnimateInView>

        <div className='divide-y divide-border overflow-hidden rounded-xl border border-border/50 bg-background'>
          {faqs.map((faq, index) => (
            <AnimateInView
              key={faq.q}
              delay={index * 60}
              animation='fade-up'
              className='min-w-0 p-6'
            >
              <h3 className='text-sm font-semibold text-foreground break-words'>
                {faq.q}
              </h3>
              <p className='mt-2 text-sm leading-7 text-muted-foreground break-words'>
                {faq.a}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
