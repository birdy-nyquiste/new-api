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

export function PainVsSolution() {
  const { t } = useTranslation()

  const solutionItems = [
    {
      title: t('Accounts and subscriptions, configured in one place'),
      body: t(
        'ChatGPT, Claude, Gemini, and more providers in one bundled setup, with subscription tiers chosen around your needs.'
      ),
    },
    {
      title: t('Stable and compliant network access'),
      body: t(
        'Global traffic access through Hong Kong or US carriers, with support for SIM / eSIM.'
      ),
    },
    {
      title: t('Complete supporting help'),
      body: t(
        'Professional support covering account setup, Apple ID, US-market phones, and the full process end to end.'
      ),
    },
    {
      title: t('API Router'),
      body: t(
        'Includes Nyquiste Router quota for users who need a unified API key and routed access as an advanced option.'
      ),
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-12 md:py-16 lg:py-20'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground break-words'>
            {t('Use global AI')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('with ease')}
            </span>
          </h2>
        </AnimateInView>

        <AnimateInView animation='fade-up' delay={100}>
          <ol className='grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-12 md:gap-5'>
            {solutionItems.map((item, index) => {
              const desktopSpan =
                index === 0 || index === 3 ? 'md:col-span-7' : 'md:col-span-5'

              return (
                <li
                  key={item.title}
                  className={`rounded-[1.75rem] border border-border/60 bg-muted/20 p-5 transition-colors duration-300 hover:bg-muted/30 sm:p-6 ${desktopSpan}`}
                >
                  <div className='mb-5 flex items-center justify-between gap-3'>
                    <span className='text-primary/75 text-[0.72rem] font-semibold tracking-[0.22em]'>
                      0{index + 1}
                    </span>
                    <span className='h-px flex-1 bg-border/70' aria-hidden />
                  </div>
                  <p className='text-[1.02rem] font-semibold leading-6 text-foreground break-words md:text-[1.08rem]'>
                    {item.title}
                  </p>
                  <p className='text-muted-foreground mt-2.5 max-w-[42rem] text-sm leading-7 break-words md:text-[0.96rem]'>
                    {item.body}
                  </p>
                </li>
              )
            })}
          </ol>
        </AnimateInView>
      </div>
    </section>
  )
}
