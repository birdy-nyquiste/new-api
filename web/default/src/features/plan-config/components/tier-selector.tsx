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
import { PRESETS } from '../data'
import type { TierId } from '../types'

interface TierSelectorProps {
  activeTier: TierId | null
  onSelect: (id: TierId) => void
}

export function TierSelector({ activeTier, onSelect }: TierSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      {PRESETS.map((preset) => {
        const isActive = activeTier === preset.id
        return (
          <button
            key={preset.id}
            type='button'
            onClick={() => onSelect(preset.id)}
            aria-pressed={isActive}
            className={cn(
              'font-landing flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-4 py-5 text-center transition-colors',
              isActive
                ? 'border-foreground bg-muted/20 ring-1 ring-foreground'
                : 'border-border/60 hover:bg-muted/30'
            )}
          >
            <span className='text-xs font-medium text-muted-foreground'>
              {t(preset.descKey)}
            </span>
            <span className='text-lg font-bold tracking-tight text-foreground'>
              {preset.name}
            </span>
            <span className='font-mono text-base font-semibold tabular-nums text-foreground'>
              ¥{preset.price.toLocaleString()}
            </span>
          </button>
        )
      })}
    </div>
  )
}
