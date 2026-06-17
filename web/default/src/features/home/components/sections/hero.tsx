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

interface HeroProps {
  isAuthenticated?: boolean
}

export function Hero({ isAuthenticated }: HeroProps) {
  const { t } = useTranslation()
  const heroTitle = t('Use top global AI without the setup work')
  const heroTitleParts = heroTitle.includes('，')
    ? heroTitle.split('，').map((part, index, parts) =>
        index < parts.length - 1 ? `${part}，` : part
      )
    : [heroTitle]

  return (
    <section className='font-landing overflow-hidden px-6 py-18 md:py-26 lg:py-34'>
      <div className='mx-auto max-w-5xl'>
        <div className='mx-auto flex max-w-3xl flex-col items-center text-center'>
          <p
            className='landing-animate-fade-up text-[clamp(1rem,2vw,1.35rem)] font-bold tracking-[0.08em] text-foreground/88'
            style={{ animationDelay: '20ms' }}
          >
            {t('Nyquiste Global AI Suite')}
          </p>

          <h1
            className='landing-animate-fade-up mt-5 max-w-2xl text-[clamp(1.9rem,4.4vw,3.15rem)] font-bold leading-[1.08] tracking-tight text-foreground break-words'
            style={{ animationDelay: '60ms' }}
          >
            {heroTitleParts.length > 1 ? (
              <span className='inline-flex max-w-full flex-wrap items-center justify-center gap-x-[0.18em] gap-y-1'>
                {heroTitleParts.map((part) => (
                  <span key={part} className='whitespace-nowrap'>
                    {part}
                  </span>
                ))}
              </span>
            ) : (
              heroTitle
            )}
          </h1>

          <div
            className='landing-animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.95rem] font-semibold tracking-[0.08em] text-foreground/72 md:mt-8'
            style={{ animationDelay: '120ms' }}
          >
            <span>ChatGPT</span>
            <span className='text-border'>/</span>
            <span>Claude</span>
            <span className='text-border'>/</span>
            <span>Gemini</span>
          </div>

          <div
            className='landing-animate-fade-up mt-8 max-w-2xl space-y-2.5 text-[clamp(1.1rem,2.25vw,1.42rem)] font-semibold leading-[1.5] tracking-tight text-foreground/86 md:mt-9'
            style={{ animationDelay: '160ms' }}
          >
            <p>
              {t('Accounts and subscriptions, prepared in one go')}
            </p>
            <p>
              {t('Supporting services, solved in one place')}
            </p>
          </div>

          <div
            className='landing-animate-fade-up mt-9 flex justify-center md:mt-10'
            style={{ animationDelay: '220ms' }}
          >
            <Button
              className='min-h-[50px] rounded-lg px-6 text-sm shadow-sm'
              render={<Link to={isAuthenticated ? '/dashboard' : '/sign-up'} />}
            >
              {t('Configure the full bundle')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
