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
import { Clock3, Hash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { ResponseMetrics as ResponseMetricsType } from '../types'

interface ResponseMetricsProps {
  metrics?: ResponseMetricsType
  className?: string
}

function formatNumber(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return value.toLocaleString()
}

function formatTime(metrics?: ResponseMetricsType) {
  const time = metrics?.useTimeMs ?? metrics?.responseTimeMs
  if (typeof time !== 'number' || Number.isNaN(time)) return '-'
  return `${Math.round(time)}ms`
}

export function ResponseMetrics({
  metrics,
  className,
}: ResponseMetricsProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs',
        className
      )}
    >
      <span className='inline-flex items-center gap-1'>
        <Clock3 className='size-3.5' />
        <span>{formatTime(metrics)}</span>
      </span>
      <span className='inline-flex items-center gap-1'>
        <Hash className='size-3.5' />
        <span title={t('Input Tokens')}>
          {t('Input')}: {formatNumber(metrics?.promptTokens)}
        </span>
        <span title={t('Output Tokens')}>
          {t('Output')}: {formatNumber(metrics?.completionTokens)}
        </span>
      </span>
    </div>
  )
}
