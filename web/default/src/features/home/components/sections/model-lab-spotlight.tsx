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
import { Gift, GitCompare, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

export function ModelLabSpotlight() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Gift,
      title: t('Free credits on sign-up'),
    },
    {
      icon: MessageSquare,
      title: t('Chat-style interaction with global models'),
    },
    {
      icon: GitCompare,
      title: t('Compare outputs from 3 models side by side — AI rates response quality'),
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView className='mb-10 flex flex-col gap-6'>
          <div className='max-w-2xl'>
            <p className='mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase'>
              {t('Model Lab')}
            </p>
            <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
              {t('Free to try, fast to start')}
            </h2>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Button
              className='min-h-[44px] rounded-lg px-5 text-sm'
              render={<Link to='/playground' />}
            >
              {t('Try Model Lab')}
            </Button>
            <Button
              variant='outline'
              className='min-h-[44px] rounded-lg border-border/50 px-5 text-sm'
            >
              {t('View CN vs US model benchmark')}
            </Button>
          </div>
        </AnimateInView>

        <div className='grid gap-px overflow-hidden rounded-xl border border-border/40 bg-border/40 md:grid-cols-3'>
          {features.map((item, index) => {
            const Icon = item.icon
            return (
              <AnimateInView
                key={item.title}
                delay={index * 70}
                animation='scale-in'
                className='min-w-0 bg-background p-6 transition-colors duration-300 hover:bg-muted/20'
              >
                <div className='mb-5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground'>
                  <Icon className='size-4' />
                </div>
                <p className='whitespace-pre-line text-sm font-semibold text-foreground break-words'>
                  {item.title}
                </p>
              </AnimateInView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
