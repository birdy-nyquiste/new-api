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
import { CheckCircle2, Layers3, Settings2, Sparkles, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function CustomConfiguration() {
  const { t } = useTranslation()

  const options = [
    {
      icon: <Layers3 className='size-4' />,
      title: t('Choose AI providers'),
      body: t(
        'Pick one or several from ChatGPT, Claude, Gemini, and additional overseas AI services.'
      ),
    },
    {
      icon: <Settings2 className='size-4' />,
      title: t('Choose subscription tiers and quota'),
      body: t(
        'Match Plus, Pro, Max, extra quota, or special plans to the way you actually use AI.'
      ),
    },
    {
      icon: <Wifi className='size-4' />,
      title: t('Choose whether you need SIM or eSIM traffic'),
      body: t(
        'Decide based on your device, location, usage cycle, and whether extra traffic should be stacked or metered.'
      ),
    },
    {
      icon: <Sparkles className='size-4' />,
      title: t('Add special service needs'),
      body: t(
        'Ask for more providers, overseas phone options, AI workflow setup, usage training, model recommendations, or team configuration.'
      ),
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start'>
          <AnimateInView className='max-w-xl'>
            <p className='mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase'>
              {t('Custom-first setup')}
            </p>
            <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
              {t('Configured around your actual needs')}
            </h2>
            <p className='mt-4 text-sm leading-7 text-muted-foreground'>
              {t(
                'This is not a rigid package. We first look at what you want to do, then combine accounts, subscription tiers, quota, traffic, and setup support.'
              )}
            </p>
            <div className='mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4'>
              <div className='flex items-start gap-3 text-sm'>
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-primary' />
                <p className='min-w-0 leading-6 text-foreground'>
                  {t(
                    'You can choose only one tool, or configure several together. The point is to stop paying with your time before you even start using AI.'
                  )}
                </p>
              </div>
            </div>
          </AnimateInView>

          <div className='grid gap-px overflow-hidden rounded-xl border border-border/40 bg-border/40 sm:grid-cols-2'>
            {options.map((item, index) => (
              <AnimateInView
                key={item.title}
                delay={index * 80}
                animation='scale-in'
                className='min-w-0 bg-background p-6 transition-colors duration-300 hover:bg-muted/20'
              >
                <div className='mb-4 flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground'>
                  {item.icon}
                </div>
                <h3 className='text-sm font-semibold text-foreground break-words'>
                  {item.title}
                </h3>
                <p className='mt-2 text-xs leading-6 text-muted-foreground break-words'>
                  {item.body}
                </p>
              </AnimateInView>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
