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

export function ManifestRow({ icon, title, description, tag }: ManifestRowProps) {
  return (
    <div className='flex items-start gap-3 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border'>
      <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-border text-muted-foreground'>
        {icon}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <span className='text-sm font-semibold tracking-tight text-foreground'>
            {title}
          </span>
          <span className='rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>
            {tag}
          </span>
        </div>
        <p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>
          {description}
        </p>
      </div>
    </div>
  )
}
