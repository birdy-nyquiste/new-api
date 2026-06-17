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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function PainVsSolution() {
  const { t } = useTranslation()

  const painItems = [
    t('Overseas account registration takes time'),
    t('Phone verification and subscription payment are inconvenient'),
    t('Mobile, desktop, and network setup can get complicated'),
    t('Trying multiple models one by one costs more time and money'),
  ]

  const solutionItems = [
    {
      title: t('We configure the accounts and subscriptions for you'),
      body: t(
        'ChatGPT, Claude, Gemini, and other services can be prepared together, with subscription tiers and quota matched to your use case.'
      ),
    },
    {
      title: t('SIM / eSIM for stable, compliant connectivity'),
      body: t(
        'Optional China Telecom Hong Kong SIM or eSIM traffic is available when your device and tools need a more stable connection.'
      ),
    },
    {
      title: t('Complete setup support'),
      body: t(
        'Professional user support covering account setup, subscriptions, quota planning, renewal, and workflow building.'
      ),
    },
    {
      title: t('Includes Nyquiste Router quota'),
      body: t(
        'One API key for global model access, built for complex coding and agent tasks.'
      ),
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-12 md:py-16 lg:py-20'>
      <div className='mx-auto max-w-4xl'>
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground break-words'>
            {t('Using global AI')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('should not mean')}
            </span>
            &nbsp;{t('spending your time on setup.')}
          </h2>
        </AnimateInView>

        <AnimateInView
          animation='fade-up'
          className='hidden items-stretch md:flex'
          delay={100}
        >
          <div className='flex-1 pr-8'>
            <p className='mb-6 flex items-center gap-2 text-[10px] font-bold tracking-[2px] text-muted-foreground uppercase'>
              <span className='h-px w-4 bg-muted-foreground/40' aria-hidden />
              {t('If you do it yourself')}
            </p>
            <ol className='space-y-11'>
              {painItems.map((item, i) => (
                <li
                  key={item}
                  className='flex items-start gap-2.5 text-sm text-muted-foreground line-through decoration-muted-foreground/40'
                >
                  <span className='mt-0.5 shrink-0 text-xs font-bold text-muted-foreground/40'>
                    {i + 1}.
                  </span>
                  <span className='min-w-0 break-words'>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className='flex items-center justify-center px-8'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground/50'>
              <ArrowRight size={14} />
            </div>
          </div>

          <div className='flex-1 pl-8'>
            <p className='mb-6 flex items-center gap-2 text-[10px] font-bold tracking-[2px] text-primary uppercase'>
              <span className='h-px w-4 bg-primary/50' aria-hidden />
              {t('With Nyquiste')}
            </p>
            <ol className='space-y-5'>
              {solutionItems.map((item) => (
                <li key={item.title} className='text-sm'>
                  <p className='font-semibold text-foreground break-words'>
                    {item.title}
                  </p>
                  <p className='mt-0.5 text-muted-foreground break-words'>
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </AnimateInView>

        <div className='grid grid-cols-1 gap-6 md:hidden'>
          <AnimateInView animation='fade-right'>
            <p className='mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[2px] text-muted-foreground uppercase'>
              <span className='h-px w-4 bg-muted-foreground/40' aria-hidden />
              {t('If you do it yourself')}
            </p>
            <ol className='space-y-3'>
              {painItems.map((item, i) => (
                <li
                  key={item}
                  className='flex items-start gap-2.5 text-sm text-muted-foreground line-through decoration-muted-foreground/40'
                >
                  <span className='mt-0.5 shrink-0 text-xs font-bold text-muted-foreground/40'>
                    {i + 1}.
                  </span>
                  <span className='min-w-0 break-words'>{item}</span>
                </li>
              ))}
            </ol>
          </AnimateInView>

          <div className='flex justify-center'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground/50'>
              <ArrowRight size={14} className='rotate-90' />
            </div>
          </div>

          <AnimateInView animation='fade-left'>
            <p className='mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[2px] text-primary uppercase'>
              <span className='h-px w-4 bg-primary/50' aria-hidden />
              {t('With Nyquiste')}
            </p>
            <ol className='space-y-4'>
              {solutionItems.map((item) => (
                <li key={item.title} className='text-sm'>
                  <p className='font-semibold text-foreground break-words'>
                    {item.title}
                  </p>
                  <p className='mt-0.5 text-muted-foreground break-words'>
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </AnimateInView>
        </div>
      </div>
    </section>
  )
}
