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
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

interface FinalCTAProps {
  isAuthenticated?: boolean
}

export function FinalCTA({ isAuthenticated }: FinalCTAProps) {
  const { t } = useTranslation()

  if (isAuthenticated) {
    return null
  }

  return (
    <section className='font-landing border-t border-border/50 px-6 py-24 md:py-32 lg:py-40'>
      <AnimateInView className='mx-auto max-w-2xl text-center' animation='scale-in'>
        <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
          {t('Nyquiste AI Suite')}
          <br />
          {t('Seamless access to global AI')}
        </h2>
        <div className='mt-8 flex justify-center'>
          <Button
            className='min-h-[44px] w-full rounded-lg sm:w-auto'
          >
            {t('Start custom setup')}
          </Button>
        </div>
      </AnimateInView>
    </section>
  )
}
