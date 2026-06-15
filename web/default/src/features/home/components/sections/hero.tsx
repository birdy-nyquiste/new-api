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
import { Monitor, Wifi, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ManifestRow } from '../manifest-row'

interface HeroProps {
  isAuthenticated?: boolean
}

export function Hero({ isAuthenticated }: HeroProps) {
  const { t } = useTranslation()

  return (
    <section className='font-landing overflow-hidden px-6 py-16 md:py-24 lg:py-32'>
      <div className='mx-auto max-w-5xl'>
        <div className='grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-12'>

          {/* Left column */}
          <div className='flex flex-col items-start text-left'>

            {/* Free credits badge */}
            {!isAuthenticated && (
              <div
                className='landing-animate-fade-up mb-6 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground'
                style={{ animationDelay: '0ms' }}
              >
                <span className='h-1.5 w-1.5 rounded-full bg-primary' aria-hidden />
                {t('New accounts get free credits')}
              </div>
            )}

            {/* Headline */}
            <h1
              className='landing-animate-fade-up text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold leading-[1.08] tracking-tight text-foreground break-words'
              style={{ animationDelay: '60ms' }}
            >
              <span className='mb-2 block'>{t('Nyquiste Router')}</span>
              <span className='block pt-1 text-muted-foreground'>
                {t('Global AI in one all-inclusive price')}
              </span>
              <span className='block text-muted-foreground'>
                {t('No complex setup')}
              </span>
            </h1>

            {/* Subtext */}
            <p
              className='landing-animate-fade-up mt-8 max-w-lg text-[15px] leading-7 text-muted-foreground'
              style={{ animationDelay: '120ms' }}
            >
              {t(
                'No need to hassle with overseas accounts, subscription payments, phone verification, or network setups. Start using global mainstream AI tools with a single payment.'
              )}
            </p>

            {/* CTAs */}
            <div
              className='landing-animate-fade-up mt-8 flex w-full flex-wrap gap-3 sm:w-auto md:mt-10 lg:mt-11'
              style={{ animationDelay: '180ms' }}
            >
              <Button
                className='min-h-[48px] flex-1 rounded-lg px-5 text-sm sm:flex-none'
                render={<Link to={isAuthenticated ? '/playground' : '/sign-up'} />}
              >
                {isAuthenticated ? t('Open Model Lab →') : t('Get started free →')}
              </Button>
              <Button
                variant='outline'
                className='min-h-[48px] flex-1 rounded-lg border-border/50 px-5 text-sm sm:flex-none'
                render={<Link to='/pricing' />}
              >
                {t('View pricing')}
              </Button>
            </div>

          </div>

          {/* Right column: bundle manifest panel */}
          <div
            className='landing-animate-fade-up rounded-xl border border-border bg-muted/40 p-5'
            style={{ animationDelay: '220ms' }}
          >
            <p className='mb-3 text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground/60'>
              {t("What's in the package")}
            </p>
            <ManifestRow
              icon={<Monitor size={16} />}
              title={t('AI Accounts')}
              description={t(
                'Official access to OpenAI, Claude, Gemini — pre-configured.'
              )}
              tag={t('Annual')}
            />
            <ManifestRow
              icon={<Wifi size={16} />}
              title={t('SIM / eSIM')}
              description={t(
                'Global data via China Telecom HK. Stable, compliant internet routing — no VPN needed.'
              )}
              tag={t('Flexible')}
            />
            <ManifestRow
              icon={<Zap size={16} />}
              title={t('API Router')}
              description={t(
                'One API key for all providers. Works with any tool or IDE that supports OpenAI format.'
              )}
              tag={t('Included')}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
