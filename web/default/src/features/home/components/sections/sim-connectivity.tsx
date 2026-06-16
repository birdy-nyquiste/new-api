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
import { RadioTower, ShieldCheck, Signal, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function SimConnectivity() {
  const { t } = useTranslation()

  const details = [
    { label: t('Carrier'), value: t('China Telecom Hong Kong') },
    { label: t('Traffic example'), value: t('50GB / 6 months') },
    { label: t('Billing'), value: t('Stackable or metered') },
    { label: t('Format'), value: t('SIM or eSIM') },
  ]

  const signals = [
    { icon: Signal, label: t('Stable access') },
    { icon: ShieldCheck, label: t('Compliant route') },
    { icon: RadioTower, label: t('Device-based advice') },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center'>
        <AnimateInView className='order-2 lg:order-1'>
          <div className='overflow-hidden rounded-xl border border-border bg-muted/30'>
            <div className='border-b border-border/50 p-5'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='text-xs font-medium tracking-widest text-muted-foreground uppercase'>
                    {t('Optional connection plan')}
                  </p>
                  <h3 className='mt-2 text-lg font-bold text-foreground'>
                    {t('Global AI traffic card')}
                  </h3>
                </div>
                <div className='flex size-11 items-center justify-center rounded-xl border border-info/20 bg-info/10 text-info'>
                  <Wifi className='size-5' />
                </div>
              </div>
            </div>
            <div className='grid gap-px bg-border/40 sm:grid-cols-2'>
              {details.map((item) => (
                <div key={item.label} className='min-w-0 bg-background p-5'>
                  <p className='text-[11px] font-medium text-muted-foreground'>
                    {item.label}
                  </p>
                  <p className='mt-1 text-sm font-semibold text-foreground break-words'>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className='grid gap-3 p-5 sm:grid-cols-3'>
              {signals.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.label}
                    className='flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs text-muted-foreground'
                  >
                    <Icon className='size-3.5 shrink-0 text-info' />
                    <span className='min-w-0 break-words'>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </AnimateInView>

        <AnimateInView className='order-1 lg:order-2'>
          <p className='mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase'>
            {t('SIM / eSIM')}
          </p>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('Stable connection when global AI needs it')}
          </h2>
          <p className='mt-4 text-sm leading-7 text-muted-foreground'>
            {t(
              'Some overseas AI services are sensitive to connection and verification environments. When your scenario needs it, we can add China Telecom Hong Kong SIM or eSIM traffic to improve the experience.'
            )}
          </p>
          <p className='mt-4 text-sm leading-7 text-muted-foreground'>
            {t(
              'Some users only need accounts. Others need a more stable connection. We confirm your device and usage scenario before recommending traffic volume or cycle.'
            )}
          </p>
        </AnimateInView>
      </div>
    </section>
  )
}
