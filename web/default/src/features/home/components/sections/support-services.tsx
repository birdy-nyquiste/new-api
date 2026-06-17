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
import { Globe2, KeyRound, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'

interface SupportServicesProps {
  isAuthenticated?: boolean
}

export function SupportServices({ isAuthenticated }: SupportServicesProps) {
  const { t } = useTranslation()

  const services = [
    {
      icon: Globe2,
      title: t('Global data'),
    },
    {
      icon: KeyRound,
      title: t('Apple ID'),
    },
    {
      icon: Smartphone,
      title: t('International phones'),
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('Supporting services,')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('everything included')}
            </span>
          </h2>
        </AnimateInView>

        <div className='grid gap-px overflow-hidden rounded-xl border border-border/40 bg-border/40 md:grid-cols-3'>
          {services.map((item, index) => {
            const Icon = item.icon

            return (
              <AnimateInView
                key={item.title}
                delay={index * 70}
                animation='scale-in'
                className='min-w-0 bg-background p-6 transition-colors duration-300 hover:bg-muted/20'
              >
                <div className='mb-5 flex size-10 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground'>
                  <Icon className='size-4' />
                </div>
                <h3 className='text-base font-semibold text-foreground break-words'>
                  {item.title}
                </h3>
              </AnimateInView>
            )
          })}
        </div>

        <AnimateInView
          className='mt-8 flex justify-center'
          animation='fade-up'
          delay={220}
        >
          <Button
            className='min-h-[48px] rounded-lg px-5 text-sm'
            render={<Link to={isAuthenticated ? '/dashboard' : '/sign-up'} />}
          >
            {t('Configure the full bundle')}
          </Button>
        </AnimateInView>
      </div>
    </section>
  )
}
