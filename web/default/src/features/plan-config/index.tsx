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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import { APPLE_ID, CONTACT_ITEMS, DEFAULT_DATA_LINE_DELIVERY, PRESETS, PROVIDERS } from './data'
import { computeTotal, matchPreset } from './pricing'
import type { DataLineDeliveryType, DataLineId, ProviderId, Selection, TierId } from './types'
import { AddonRow } from './components/addon-row'
import { GlobalDataList } from './components/global-data-list'
import { ProviderCard } from './components/provider-card'
import { SummaryPanel } from './components/summary-panel'
import { TierSelector } from './components/tier-selector'

const INITIAL: Selection = {
  upgrades: [],
  dataLines: [{ id: 'ct-hk', delivery: DEFAULT_DATA_LINE_DELIVERY }],
  appleId: false,
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function PlanConfig() {
  const { t } = useTranslation()
  const [selection, setSelection] = useState<Selection>(INITIAL)

  const total = computeTotal(selection)
  const activeTier = matchPreset(selection)

  const applyPreset = (id: TierId) => {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) return
    setSelection({
      upgrades: [...preset.upgrades],
      dataLines: preset.dataLines.map((lineId) => ({ id: lineId, delivery: DEFAULT_DATA_LINE_DELIVERY })),
      appleId: false,
    })
  }

  const toggleUpgrade = (id: ProviderId) =>
    setSelection((s) => ({ ...s, upgrades: toggle(s.upgrades, id) }))
  const toggleDataLine = (id: DataLineId) =>
    setSelection((s) => {
      const exists = s.dataLines.some((line) => line.id === id)
      return {
        ...s,
        dataLines: exists
          ? s.dataLines.filter((line) => line.id !== id)
          : [...s.dataLines, { id, delivery: DEFAULT_DATA_LINE_DELIVERY }],
      }
    })
  const setDataLineDelivery = (id: DataLineId, delivery: DataLineDeliveryType) =>
    setSelection((s) => ({
      ...s,
      dataLines: s.dataLines.map((line) => (line.id === id ? { ...line, delivery } : line)),
    }))
  const toggleAppleId = () => setSelection((s) => ({ ...s, appleId: !s.appleId }))

  return (
    <PublicLayout showMainContainer={false}>
      <main className='font-landing min-w-0 overflow-x-hidden'>
        <div className='mx-auto w-full max-w-6xl px-6 pt-24 pb-16 md:pt-28 md:pb-20'>
          <AnimateInView className='mx-auto mb-10 max-w-2xl text-center'>
            <h1 className='text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-tight text-foreground'>
              {t('Configure your AI bundle')}
            </h1>
          </AnimateInView>

          <AnimateInView className='mb-10' delay={80}>
            <TierSelector activeTier={activeTier} onSelect={applyPreset} />
          </AnimateInView>

          <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start'>
            <div className='space-y-8'>
              <AnimateInView animation='fade-up' delay={120}>
                <p className='mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                  ✓ {t('Included in every plan')}
                </p>
                <p className='mb-4 text-sm text-muted-foreground'>{t('AI providers & subscriptions')}</p>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {PROVIDERS.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      upgraded={selection.upgrades.includes(provider.id)}
                      onToggleUpgrade={() => toggleUpgrade(provider.id)}
                    />
                  ))}
                </div>
              </AnimateInView>

              <AnimateInView animation='fade-up' delay={160}>
                <p className='mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                  {t('International Roaming Data')}
                </p>
                <p className='mb-4 text-sm text-muted-foreground'>
                  {t('Default 50 GB · SIM / eSIM available')}
                </p>
                <GlobalDataList
                  selected={selection.dataLines}
                  onToggle={toggleDataLine}
                  onDeliveryChange={setDataLineDelivery}
                />
              </AnimateInView>

              <div className='grid gap-6 sm:grid-cols-2'>
                <AnimateInView animation='fade-up' delay={200}>
                  <p className='mb-4 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                    {t('Apple ID')}
                  </p>
                  <AddonRow
                    label={t('US region Apple ID')}
                    price={APPLE_ID.price}
                    selected={selection.appleId}
                    onToggle={toggleAppleId}
                  />
                </AnimateInView>

                <AnimateInView animation='fade-up' delay={220}>
                  <p className='mb-4 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                    {t('More options')}
                  </p>
                  <div className='space-y-2.5'>
                    {CONTACT_ITEMS.map((item) => (
                      <AddonRow key={item.id} label={t(item.labelKey)} contact />
                    ))}
                  </div>
                </AnimateInView>
              </div>
            </div>

            <AnimateInView animation='fade-up' delay={140}>
              <div aria-hidden className='mb-1 h-[14px]' />
              <p className='mb-4 text-sm text-muted-foreground'>
                {t('Your configuration')}
              </p>
              <SummaryPanel selection={selection} total={total} />
            </AnimateInView>
          </div>
        </div>
        <Footer
          compactBar
          compactBarCopyright={t('© 2023 - 2026 Nyquiste Corporation. All rights reserved.')}
        />
      </main>
    </PublicLayout>
  )
}
