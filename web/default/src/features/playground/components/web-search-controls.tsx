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
import { CheckIcon, GlobeIcon, LockIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { cn } from '@/lib/utils'
import type { WebSearchSupport } from '../lib/web-search-support'

interface WebSearchControlProps {
  support: WebSearchSupport
  enabled: boolean
  onToggle?: () => void
  disabled?: boolean
}

/**
 * "Web search" entry in the input "+" dropdown.
 * - supported: toggles on/off, shows a check mark when on
 * - builtin: locked on ("Built-in web search")
 * - unsupported: disabled with an explanatory hint
 */
export function WebSearchMenuItem({
  support,
  enabled,
  onToggle,
}: WebSearchControlProps) {
  const { t } = useTranslation()

  if (support === 'builtin') {
    return (
      <DropdownMenuItem disabled>
        <GlobeIcon className='mr-2' size={16} />
        <span className='flex-1'>{t('Built-in web search')}</span>
        <LockIcon className='ml-2 opacity-70' size={14} />
      </DropdownMenuItem>
    )
  }

  if (support === 'unsupported') {
    return (
      <DropdownMenuItem disabled>
        <GlobeIcon className='mr-2' size={16} />
        <div className='flex flex-col'>
          <span>{t('Web search')}</span>
          <span className='text-muted-foreground text-xs'>
            {t('This model does not support web search')}
          </span>
        </div>
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem onClick={() => onToggle?.()}>
      <GlobeIcon className='mr-2' size={16} />
      <span className='flex-1'>{t('Web search')}</span>
      {enabled && <CheckIcon className='ml-2' size={16} />}
    </DropdownMenuItem>
  )
}

/**
 * Globe chip shown next to the "+" button while web search is active,
 * so the state is visible without opening the dropdown. Clicking it
 * turns web search off ('builtin' is locked and not clickable).
 */
export function WebSearchChip({
  support,
  enabled,
  onToggle,
  disabled,
}: WebSearchControlProps) {
  const { t } = useTranslation()

  const builtin = support === 'builtin'
  const active = builtin || (support === 'supported' && enabled)
  if (!active) return null

  return (
    <PromptInputButton
      aria-pressed
      className={cn(
        'border font-medium',
        'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
        builtin && 'pointer-events-none'
      )}
      disabled={disabled}
      onClick={builtin ? undefined : onToggle}
      variant='outline'
    >
      <GlobeIcon size={16} />
      <span className='hidden sm:inline'>
        {builtin ? t('Built-in web search') : t('Web search')}
      </span>
      {builtin && <LockIcon size={12} className='opacity-70' />}
    </PromptInputButton>
  )
}
