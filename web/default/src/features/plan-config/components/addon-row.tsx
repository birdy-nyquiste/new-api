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

import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface AddonRowProps {
  label: React.ReactNode
  /** Show "+¥price"; omit for contact rows. */
  price?: number
  selected?: boolean
  /** Renders a non-interactive "Contact us →" placeholder row. */
  contact?: boolean
  onToggle?: () => void
}

export function AddonRow({ label, price, selected, contact, onToggle }: AddonRowProps) {
  const { t } = useTranslation()

  if (contact) {
    return (
      <div className='font-landing flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-xl border border-dashed border-border/50 px-4 py-3 text-sm text-muted-foreground'>
        <span className='font-medium'>{label}</span>
        <span className='text-xs'>{t('Contact us →')}</span>
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'font-landing flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
        selected
          ? 'border-foreground bg-muted/20 ring-1 ring-foreground'
          : 'border-border/60 hover:bg-muted/30'
      )}
    >
      <span className='flex items-center gap-2.5 font-medium text-foreground'>
        <span
          className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
            selected ? 'border-foreground bg-foreground text-background' : 'border-border'
          )}
        >
          {selected && <Check className='size-3' />}
        </span>
        {label}
      </span>
      {price != null && (
        <span className='font-mono text-sm font-semibold tabular-nums text-foreground'>
          +¥{price.toLocaleString()}
        </span>
      )}
    </button>
  )
}
