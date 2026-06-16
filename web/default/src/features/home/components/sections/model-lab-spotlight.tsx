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

export function ModelLabSpotlight() {
  const { t } = useTranslation()

  const features = [
    t('Compare ChatGPT, Claude, Gemini, and routed models side by side'),
    t('Test prompts before committing to a daily workflow'),
    t('Connect API-compatible tools when you need developer access'),
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-12 md:py-16 lg:py-20'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView animation='fade-up'>
          <div className='grid grid-cols-1 items-start gap-8 rounded-xl border border-border p-8 md:grid-cols-[1fr_auto] md:gap-12 md:p-12'>
            <div>
              <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
                {t('Model Lab')}
                <br />
                <span
                  className='italic font-normal text-muted-foreground'
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {t('as secondary proof for power users.')}
                </span>
              </h2>
              <p className='mt-4 max-w-2xl text-sm leading-7 text-muted-foreground'>
                {t(
                  'The account and connection setup is the core offer. For advanced users, Model Lab and API Router make it easier to test model fit and connect OpenAI-compatible tools.'
                )}
              </p>

              <ul className='mt-5 space-y-2'>
                {features.map((feature) => (
                  <li
                    key={feature}
                    className='flex items-start gap-2.5 text-sm text-muted-foreground'
                  >
                    <span
                      className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary'
                      aria-hidden
                    />
                    <span className='min-w-0 break-words'>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='flex flex-col items-center gap-3 md:min-w-[190px]'>
              <span className='rounded-full border border-border px-3 py-1.5 text-center text-[10px] font-semibold text-muted-foreground'>
                {t('Included as an advanced option')}
              </span>
              <Button
                className='min-h-[44px] w-full rounded-lg'
                render={<Link to='/playground' />}
              >
                {t('Try Model Lab')}
              </Button>
              <Link
                to='/pricing'
                className='text-[11px] text-muted-foreground/60 underline decoration-border underline-offset-2 transition-colors hover:text-muted-foreground'
              >
                {t('or view configuration options')}
              </Link>
            </div>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
