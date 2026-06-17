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
}

interface ProviderCardProps {
  provider: string
  plan: string
  models: ModelItem[]
}

export function ProviderCard({ provider, plan, models }: ProviderCardProps) {
  return (
    <div className='flex min-w-0 flex-col p-5 [overflow-wrap:anywhere]'>
      <div className='mb-4 flex min-w-0 items-start justify-between gap-3'>
        <h3 className='min-w-0 text-lg font-extrabold tracking-tight text-foreground break-words text-left'>
          {provider}
        </h3>
        <span className='shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary text-right'>
          {plan}
        </span>
      </div>
      <div className='space-y-2'>
        {models.map((model) => (
          <div
            key={model.name}
            className='bg-muted/50 flex min-w-0 items-center rounded-md px-3 py-2'
          >
            <span className='text-foreground min-w-0 text-sm font-medium break-words'>
              {model.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
