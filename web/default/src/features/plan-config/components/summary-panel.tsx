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
import { APPLE_ID, BASE_PRICE, GLOBAL_DATA_LINES, PROVIDERS } from '../data'
import type { Selection } from '../types'

interface SummaryPanelProps {
  selection: Selection
  total: number
}

export function SummaryPanel({ selection, total }: SummaryPanelProps) {
  const { t } = useTranslation()

  const upgradeLines = PROVIDERS.filter((p) => selection.upgrades.includes(p.id))
  const subscriptionPlanNames = PROVIDERS.map((provider) =>
    selection.upgrades.includes(provider.id) ? provider.upgrade.productName : provider.included.productName
  )
  const dataLines = selection.dataLines
    .map((selectedLine) => {
      const line = GLOBAL_DATA_LINES.find((item) => item.id === selectedLine.id)
      return line ? { ...line, delivery: selectedLine.delivery } : null
    })
    .filter((line) => line !== null)

  return (
    <div className='font-landing rounded-2xl border border-border/60 p-5 lg:sticky lg:top-24'>
      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between gap-3'>
          <span className='text-foreground'>{t('Subscription bundle')}</span>
          <span className='font-mono tabular-nums text-foreground'>¥{BASE_PRICE.toLocaleString()}</span>
        </div>
        <p className='text-xs text-muted-foreground'>{subscriptionPlanNames.join(' · ')}</p>

        {upgradeLines.map((p) => (
          <div key={p.id} className='flex items-center justify-between gap-3 border-t border-border/30 pt-2'>
            <span className='text-foreground'>{t('Upgrade to {{plan}}', { plan: p.upgrade.productName })}</span>
            <span className='font-mono tabular-nums text-foreground'>¥{p.upgrade.price.toLocaleString()}</span>
          </div>
        ))}

        {dataLines.map((l) => (
          <div key={l.id} className='flex items-center justify-between gap-3 border-t border-border/30 pt-2'>
            <span className='text-foreground'>
              {t(l.labelKey)} · {t(l.delivery === 'sim' ? 'SIM Card' : 'eSIM')}
            </span>
            <span className='font-mono tabular-nums text-foreground'>¥{l.price.toLocaleString()}</span>
          </div>
        ))}

        {selection.appleId && (
          <div className='flex items-center justify-between gap-3 border-t border-border/30 pt-2'>
            <span className='text-foreground'>{t('US region Apple ID')}</span>
            <span className='font-mono tabular-nums text-foreground'>¥{APPLE_ID.price.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className='mt-4 flex items-center justify-between border-t-2 border-border/50 pt-3'>
        <span className='text-base font-bold text-foreground'>{t('Total')}</span>
        <span className='font-mono text-xl font-extrabold tabular-nums text-foreground'>
          ¥{total.toLocaleString()}
        </span>
      </div>

      <Button type='button' className='mt-4 min-h-[48px] w-full rounded-lg text-sm'>
        {t('Proceed')}
      </Button>
      <p className='mt-2 text-center text-[10px] text-muted-foreground'>
        {t("This is a preview — checkout isn't available yet.")}
      </p>
    </div>
  )
}
