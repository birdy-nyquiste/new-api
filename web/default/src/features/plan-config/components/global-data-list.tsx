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
import { cn } from '@/lib/utils'
import { GLOBAL_DATA_LINES } from '../data'
import type { DataLineDeliveryType, DataLineId, DataLineSelection } from '../types'
import { AddonRow } from './addon-row'

interface GlobalDataListProps {
  selected: DataLineSelection[]
  onToggle: (id: DataLineId) => void
  onDeliveryChange: (id: DataLineId, delivery: DataLineDeliveryType) => void
}

const DELIVERY_OPTIONS: DataLineDeliveryType[] = ['sim', 'esim']

export function GlobalDataList({ selected, onToggle, onDeliveryChange }: GlobalDataListProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-2.5'>
      {GLOBAL_DATA_LINES.map((line) => {
        const selectedLine = selected.find((item) => item.id === line.id)

        return (
          <div key={line.id} className='space-y-2'>
            <AddonRow
              label={t(line.labelKey)}
              price={line.price}
              selected={Boolean(selectedLine)}
              onToggle={() => onToggle(line.id)}
            />
            {selectedLine && (
              <div className='flex gap-2 pl-6'>
                {DELIVERY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type='button'
                    onClick={() => onDeliveryChange(line.id, option)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      selectedLine.delivery === option
                        ? 'border-foreground bg-muted/20 text-foreground'
                        : 'border-border/60 text-muted-foreground hover:bg-muted/30'
                    )}
                  >
                    {t(option === 'sim' ? 'SIM Card' : 'eSIM')}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
      <AddonRow label={t('Need more Global Data?')} contact />
    </div>
  )
}
