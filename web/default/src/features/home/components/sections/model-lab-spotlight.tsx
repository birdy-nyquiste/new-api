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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

export function ModelLabSpotlight() {
  const { t } = useTranslation()

  const features = [
    t('Side-by-side responses in real time'),
    t('Switch models without retyping your prompt'),
    t('Token count and response time for each model'),
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-4xl'>
        <AnimateInView animation='fade-up'>
          <div className='grid grid-cols-1 items-center gap-8 rounded-2xl border border-border p-8 md:grid-cols-[1fr_auto] md:gap-12 md:p-12'>

            {/* Left: copy */}
            <div>
              <p className='mb-3 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
                {t('Model Lab')}
              </p>
              <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
                {t('Compare every model,')}&nbsp;
                <span
                  className='italic font-normal text-muted-foreground'
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {t('with one prompt.')}
                </span>
              </h2>
              <p className='mt-4 max-w-[46ch] text-sm leading-relaxed text-muted-foreground'>
                {t(
                  'Send the same message to GPT-4o, Claude, and Gemini simultaneously. See how each model thinks, writes, and reasons — then decide which fits your workflow.'
                )}
              </p>
              <ul className='mt-5 space-y-2'>
                {features.map((feature) => (
                  <li
                    key={feature}
                    className='flex items-center gap-2.5 text-sm text-muted-foreground'
                  >
                    <span
                      className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary'
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CTA */}
            <div className='flex flex-col items-center gap-3 md:min-w-[180px]'>
              <span className='rounded-full border border-border px-3 py-1.5 text-center text-[10px] font-semibold text-muted-foreground'>
                {t('New accounts get free credits')}
              </span>
              <Button
                className='min-h-[44px] w-full rounded-lg'
                render={<Link to='/playground' />}
              >
                {t('Try Model Lab →')}
              </Button>
              <Link
                to='/pricing'
                className='text-[11px] text-muted-foreground/60 underline underline-offset-2 decoration-border hover:text-muted-foreground transition-colors'
              >
                {t('or view pricing first')}
              </Link>
            </div>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
