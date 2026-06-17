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

import type {
  DataLineConfig,
  PresetConfig,
  ProviderConfig,
} from './types'

export const BASE_PRICE = 6666

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'OpenAI.Color',
    included: { productName: 'ChatGPT Plus', features: [] },
    upgrade: { productName: 'ChatGPT Pro', price: 8888, features: [] },
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'Claude.Color',
    included: { productName: 'Claude Pro', features: [] },
    upgrade: { productName: 'Claude Max', price: 8888, features: [] },
  },
  {
    id: 'google',
    name: 'Google',
    icon: 'Gemini.Color',
    included: { productName: 'Google AI Pro', features: [] },
    upgrade: { productName: 'Google AI Ultra', price: 8888, features: [] },
  },
]

export const GLOBAL_DATA_LINES: DataLineConfig[] = [
  { id: 'cmcc-hk', labelKey: 'China Mobile (HK)', price: 2222 },
  { id: 'ct-hk', labelKey: 'China Telecom (HK)', price: 2222 },
  { id: 'us-mobile', labelKey: 'US Mobile (US)', price: 3333 },
]

export const APPLE_ID = { labelKey: 'US region Apple ID', price: 120 }

/** Contact-only items: no price, disabled placeholder CTA. */
export const CONTACT_ITEMS: { id: string; labelKey: string }[] = [
  { id: 'more-providers', labelKey: 'Need more AI providers?' },
  { id: 'overseas-phone', labelKey: 'Need an overseas phone?' },
]

export const PRESETS: PresetConfig[] = [
  { id: 'standard', name: 'Standard', descKey: 'Base bundle', price: 6666, upgrades: [], dataLines: [] },
  { id: 'pro', name: 'Pro', descKey: '+ HK Global Data', price: 8888, upgrades: [], dataLines: ['ct-hk'] },
  { id: 'ultra', name: 'Ultra', descKey: '+ US Global Data', price: 9999, upgrades: [], dataLines: ['us-mobile'] },
]
