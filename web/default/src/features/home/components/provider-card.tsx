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
interface ModelItem {
  name: string
  category: string
}

interface ProviderCardProps {
  name: string
  plan: string
  models: ModelItem[]
  description: string
}

export function ProviderCard({
  name,
  plan,
  models,
  description,
}: ProviderCardProps) {
  return (
    <div className='flex min-w-0 flex-col p-5 [overflow-wrap:anywhere]'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <span className='text-foreground min-w-0 text-lg font-extrabold tracking-tight break-words'>
          {name}
        </span>
        <span className='bg-primary/10 text-primary max-w-full rounded-full px-2.5 py-0.5 text-[10px] font-semibold break-words'>
          {plan}
        </span>
      </div>
      <div className='mb-4 space-y-1.5'>
        {models.map((model) => (
          <div
            key={model.name}
            className='bg-muted/50 flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md px-3 py-1.5'
          >
            <span className='text-foreground min-w-0 text-xs font-medium break-words'>
              {model.name}
            </span>
            <span className='text-muted-foreground/70 min-w-0 text-[10px] break-words'>
              {model.category}
            </span>
          </div>
        ))}
      </div>
      <p className='flex-1 border-border text-muted-foreground/70 border-t pt-3 text-[11px] leading-relaxed break-words italic'>
        {description}
      </p>
    </div>
  )
}
