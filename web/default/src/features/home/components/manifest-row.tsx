/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import type { ReactNode } from 'react'

interface ManifestRowProps {
  icon: ReactNode
  title: string
  description: string
  tag: string
}

export function ManifestRow({
  icon,
  title,
  description,
  tag,
}: ManifestRowProps) {
  return (
    <div className='[&:not(:last-child)]:border-border flex items-start gap-3 py-3 [&:not(:last-child)]:border-b'>
      <div className='border-border text-muted-foreground flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border'>
        {icon}
      </div>
      <div className='min-w-0 flex-1 [overflow-wrap:anywhere]'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <span className='text-foreground min-w-0 text-sm font-semibold tracking-tight'>
            {title}
          </span>
          <span className='border-border text-muted-foreground/70 max-w-full rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-widest break-words uppercase'>
            {tag}
          </span>
        </div>
        <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed break-words'>
          {description}
        </p>
      </div>
    </div>
  )
}
