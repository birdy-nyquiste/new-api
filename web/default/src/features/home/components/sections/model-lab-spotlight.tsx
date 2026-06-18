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
import {
  MODEL_LAB_COMPARE_PATH,
  MODEL_LAB_ROUTE,
} from '@/features/model-lab/constants'

interface ModelLabSpotlightProps {
  isAuthenticated?: boolean
}

export function ModelLabSpotlight({ isAuthenticated }: ModelLabSpotlightProps) {
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
      title: t(
        'Compare outputs from 3 models side by side — AI rates response quality'
      ),
    },
  ]

  return (
    <section className='font-landing border-border/50 border-t px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-5xl'>
        <AnimateInView className='mb-10 flex flex-col items-center gap-6 text-center'>
          <div className='max-w-2xl'>
            <h2 className='text-foreground text-[clamp(1.5rem,3.5vw,2.2rem)] leading-tight font-extrabold tracking-tight'>
              {t('Model Lab,')}&nbsp;
              <span
                className='text-muted-foreground font-normal italic'
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {t('compare Chinese and US models')}
              </span>
            </h2>
          </div>
          <div className='flex flex-wrap justify-center gap-3'>
            <Button
              className='min-h-[44px] rounded-lg px-5 text-sm'
              render={
                isAuthenticated ? (
                  <Link to={MODEL_LAB_ROUTE} search={{ mode: 'compare' }} />
                ) : (
                  <Link
                    to='/sign-up'
                    search={{ redirect: MODEL_LAB_COMPARE_PATH }}
                  />
                )
              }
            >
              {isAuthenticated
                ? t('Open Model Lab action')
                : t('Try Model Lab')}
            </Button>
            <Button
              variant='outline'
              className='border-border/50 min-h-[44px] rounded-lg px-5 text-sm'
              render={<Link to='/cn-us-compare' />}
            >
              {t('View CN vs US model benchmark')}
            </Button>
          </div>
        </AnimateInView>

        <div className='border-border/40 bg-border/40 grid gap-px overflow-hidden rounded-xl border md:grid-cols-3'>
          {features.map((item, index) => {
            const Icon = item.icon
            return (
              <AnimateInView
                key={item.title}
                delay={index * 70}
                animation='scale-in'
                className='bg-background hover:bg-muted/20 min-w-0 p-6 text-center transition-colors duration-300'
              >
                <div className='border-border/60 bg-muted/30 text-muted-foreground mx-auto mb-5 flex size-9 shrink-0 items-center justify-center rounded-lg border'>
                  <Icon className='size-4' />
                </div>
                <p className='text-foreground text-sm font-semibold break-words whitespace-pre-line'>
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
