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
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import type { ProviderConfig } from '../types'

interface ProviderCardProps {
  provider: ProviderConfig
  upgraded: boolean
  onToggleUpgrade: () => void
}

export function ProviderCard({ provider, upgraded, onToggleUpgrade }: ProviderCardProps) {
  const { t } = useTranslation()
  const features = upgraded ? provider.upgrade.features : provider.included.features

  return (
    <div className='font-landing flex flex-col gap-3 rounded-2xl border border-border/60 p-5'>
      <div className='flex items-center gap-2.5'>
        <span className='flex size-8 shrink-0 items-center justify-center'>
          {getLobeIcon(provider.icon, 28)}
        </span>
        <span className='text-sm font-semibold text-foreground'>{provider.name}</span>
      </div>

      <span className='inline-flex w-max items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-foreground'>
        <Check className='size-3' />
        {provider.included.productName}
      </span>

      <div>
        <p className='mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
          {t('What you get')}
        </p>
        {/* Side-by-side (sm+): fixed, responsive height with internal scroll so all
            cards stay equal height. Stacked (mobile): height adapts to content, no scroll. */}
        <div className='sm:h-40 sm:overflow-y-auto sm:pr-1 lg:h-44'>
          {features.length > 0 ? (
            <ul className='space-y-1.5 text-xs text-muted-foreground'>
              {features.map((f) => (
                <li key={f.title} className='flex items-start gap-1.5'>
                  <span aria-hidden className='mt-0.5'>·</span>
                  <span>
                    <span className='text-foreground'>{t(f.title)}</span>
                    {f.detail && (
                      <span className='mt-0.5 block text-[11px] text-muted-foreground/80'>
                        {t(f.detail)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className='space-y-2'>
              <div className='h-2 w-full rounded bg-muted/60' />
              <div className='h-2 w-3/4 rounded bg-muted/60' />
              <p className='text-[10px] text-muted-foreground/70 italic'>
                {t('Plan details synced from official site')}
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type='button'
        onClick={onToggleUpgrade}
        aria-pressed={upgraded}
        className={cn(
          'mt-auto flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition-colors',
          upgraded
            ? 'border-foreground bg-muted/20 ring-1 ring-foreground'
            : 'border-dashed border-border/60 hover:bg-muted/30'
        )}
      >
        <span className='font-medium text-foreground'>
          ↑ {t('Upgrade to {{plan}}', { plan: provider.upgrade.productName })}
        </span>
        <span className='font-mono font-semibold tabular-nums text-foreground'>
          +¥{provider.upgrade.price.toLocaleString()}
        </span>
      </button>
    </div>
  )
}
