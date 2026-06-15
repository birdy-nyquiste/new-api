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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function PainVsSolution() {
  const { t } = useTranslation()

  const painItems = [
    t('Apply for an overseas email and phone number just to sign up'),
    t('Need a foreign credit card — or find someone abroad to pay for you'),
    t("Set up a VPN — and hope it doesn't get blocked mid-session"),
    t('Repeat for every provider: ChatGPT, Claude, Gemini separately'),
  ]

  const solutionItems = [
    {
      title: t('We create and subscribe the accounts for you'),
      body: t(
        'Receive your OpenAI, Claude, or Gemini login — just sign in and use it.'
      ),
      chips: null,
    },
    {
      title: t('Pay your way — local or international'),
      body: null,
      chips: [t('WeChat Pay'), t('Alipay'), t('Bank card'), t('Credit card')],
    },
    {
      title: t('SIM / eSIM for stable, compliant connectivity'),
      body: t(
        'China Telecom HK routing — reliable access without consumer VPN risk'
      ),
      chips: null,
    },
    {
      title: t('Nyquiste Router credit included'),
      body: t(
        'Use any AI model via base URL + API key — works with Cursor, VS Code, and any OpenAI-compatible tool'
      ),
      chips: null,
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-12 md:py-16 lg:py-20'>
      <div className='mx-auto max-w-4xl'>

        {/* Header */}
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground break-words'>
            {t('Getting global AI')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('used to mean')}
            </span>
            <br />
            {t('jumping through hoops.')}
          </h2>
        </AnimateInView>

        {/* ── Desktop: 3-column flex, no table lines ── */}
        <AnimateInView animation='fade-up' className='hidden md:flex items-stretch' delay={100}>

          {/* Left: pain list */}
          <div className='flex-1 pr-8'>
            <p className='mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground'>
              <span className='h-px w-4 bg-muted-foreground/40' aria-hidden />
              {t('Without Nyquiste Router')}
            </p>
            <ol className='space-y-5'>
              {painItems.map((item, i) => (
                <li key={i} className='flex items-start gap-2.5 text-sm text-muted-foreground line-through decoration-muted-foreground/40'>
                  <span className='mt-0.5 flex-shrink-0 text-xs font-bold text-muted-foreground/40'>{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          {/* Center: arrow, vertically centered */}
          <div className='flex items-center justify-center px-8'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground/50'>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Right: solution list */}
          <div className='flex-1 pl-8'>
            <p className='mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
              <span className='h-px w-4 bg-primary/50' aria-hidden />
              {t('With Nyquiste Router')}
            </p>
            <ol className='space-y-5'>
              {solutionItems.map((item, i) => (
                <li key={i} className='text-sm'>
                  <p className='font-semibold text-foreground'>{item.title}</p>
                  {item.body && (
                    <p className='mt-0.5 text-muted-foreground'>{item.body}</p>
                  )}
                  {item.chips && (
                    <div className='mt-1.5 flex flex-wrap gap-1.5'>
                      {item.chips.map((chip) => (
                        <span
                          key={chip}
                          className='rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground'
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </AnimateInView>

        {/* ── Mobile: stacked list → arrow → list ── */}
        <div className='grid grid-cols-1 gap-6 md:hidden'>

          <AnimateInView animation='fade-right'>
            <p className='mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground'>
              <span className='h-px w-4 bg-muted-foreground/40' aria-hidden />
              {t('Without Nyquiste Router')}
            </p>
            <ol className='space-y-3'>
              {painItems.map((item, i) => (
                <li
                  key={i}
                  className='flex items-start gap-2.5 text-sm text-muted-foreground line-through decoration-muted-foreground/40'
                >
                  <span className='mt-0.5 flex-shrink-0 text-xs font-bold text-muted-foreground/40'>
                    {i + 1}.
                  </span>
                  {item}
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
            <p className='mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
              <span className='h-px w-4 bg-primary/50' aria-hidden />
              {t('With Nyquiste Router')}
            </p>
            <ol className='space-y-4'>
              {solutionItems.map((item, i) => (
                <li key={i} className='text-sm'>
                  <p className='font-semibold text-foreground'>{item.title}</p>
                  {item.body && (
                    <p className='mt-0.5 text-muted-foreground'>{item.body}</p>
                  )}
                  {item.chips && (
                    <div className='mt-1.5 flex flex-wrap gap-1.5'>
                      {item.chips.map((chip) => (
                        <span
                          key={chip}
                          className='rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground'
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </AnimateInView>
        </div>

      </div>
    </section>
  )
}
