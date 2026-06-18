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

export type TierId = 'standard' | 'pro' | 'ultra'
export type ProviderId = 'openai' | 'anthropic' | 'google'
export type DataLineId = 'cmcc-hk' | 'ct-hk' | 'us-mobile'

/** Current user selection. Base bundle is always included and not represented here. */
export interface Selection {
  upgrades: ProviderId[]
  dataLines: DataLineId[]
  appleId: boolean
}

/** A single plan feature. `title` is an i18n key; `detail` is an optional i18n key
 *  for a secondary description line (used by Google's title+description format). */
interface PlanFeature {
  title: string
  detail?: string
}

interface SubscriptionTier {
  /** Literal product name, e.g. "ChatGPT Plus". Not translated. */
  productName: string
  features: PlanFeature[]
}

export interface ProviderConfig {
  id: ProviderId
  /** Literal brand name. Not translated. */
  name: string
  /** lobe icon name passed to getLobeIcon, e.g. "OpenAI.Color". */
  icon: string
  included: SubscriptionTier
  upgrade: {
    /** Literal product name, e.g. "ChatGPT Pro". Rendered via t('Upgrade to {{plan}}'). */
    productName: string
    price: number
    features: PlanFeature[]
  }
}

export interface DataLineConfig {
  id: DataLineId
  /** i18n key, e.g. "China Telecom (HK)". */
  labelKey: string
  price: number
}

export interface PresetConfig {
  id: TierId
  /** Literal tier name: Standard / Pro / Ultra. */
  name: string
  /** i18n key for the short descriptor under the name. */
  descKey: string
  /** Display price shown on the preset card. */
  price: number
  upgrades: ProviderId[]
  dataLines: DataLineId[]
}
