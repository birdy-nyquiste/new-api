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

export function ProviderCard({ name, plan, models, description }: ProviderCardProps) {
  return (
    <div className='flex flex-col p-5'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <span className='text-lg font-extrabold tracking-tight text-foreground'>
          {name}
        </span>
        <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary'>
          {plan}
        </span>
      </div>
      <div className='mb-4 flex-1 space-y-1.5'>
        {models.map((model) => (
          <div
            key={model.name}
            className='flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5'
          >
            <span className='text-xs font-medium text-foreground'>{model.name}</span>
            <span className='flex-shrink-0 text-[10px] text-muted-foreground/70'>
              {model.category}
            </span>
          </div>
        ))}
      </div>
      <p className='border-t border-border pt-3 text-[11px] italic leading-relaxed text-muted-foreground/70'>
        {description}
      </p>
    </div>
  )
}
