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

import { APPLE_ID, BASE_PRICE, GLOBAL_DATA_LINES, PRESETS, PROVIDERS } from './data'
import type { Selection, TierId } from './types'

export function computeTotal(selection: Selection): number {
  let total = BASE_PRICE
  for (const id of selection.upgrades) {
    const provider = PROVIDERS.find((p) => p.id === id)
    if (provider) total += provider.upgrade.price
  }
  for (const id of selection.dataLines) {
    const line = GLOBAL_DATA_LINES.find((l) => l.id === id)
    if (line) total += line.price
  }
  if (selection.appleId) total += APPLE_ID.price
  return total
}

function sameDataLines(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((id) => set.has(id))
}

/** Returns the preset whose add-ons exactly match the selection, else null (custom). */
export function matchPreset(selection: Selection): TierId | null {
  if (selection.upgrades.length > 0 || selection.appleId) return null
  const preset = PRESETS.find(
    (p) => p.upgrades.length === 0 && sameDataLines(p.dataLines, selection.dataLines)
  )
  return preset ? preset.id : null
}
