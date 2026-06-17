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
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function HomeFAQ() {
  const { t } = useTranslation()

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-4xl'>
        <AnimateInView className='mb-10'>
          <p className='mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase'>
            {t('FAQ')}
          </p>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('Questions before you configure')}
          </h2>
        </AnimateInView>

        <AnimateInView animation='fade-up'>
          <div className='rounded-xl border border-dashed border-border/50 bg-muted/20 px-8 py-12 text-center'>
            <p className='text-sm text-muted-foreground'>{t('Working in progress')}</p>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
