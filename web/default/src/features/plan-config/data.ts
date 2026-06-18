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
  DataLineDeliveryType,
  DataLineConfig,
  PresetConfig,
  ProviderConfig,
} from './types'

export const DEFAULT_DATA_LINE_DELIVERY: DataLineDeliveryType = 'esim'

export const BASE_PRICE = 6666

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'OpenAI.Color',
    included: {
      productName: 'ChatGPT Plus',
      features: [
        { title: 'Advanced reasoning with GPT-5.5 Thinking' },
        { title: 'More complex and accurate image creation' },
        { title: 'Expanded deep research and agent mode' },
        { title: 'Expanded memory and context' },
        { title: 'Expanded Codex usage' },
        { title: 'Early access to new features' },
      ],
    },
    upgrade: {
      productName: 'ChatGPT Pro',
      price: 8888,
      features: [
        { title: '5x or 20x more usage' },
        { title: 'Pro reasoning with GPT-5.5 Pro' },
        { title: 'Maximum Codex tasks' },
        { title: 'Unlimited and faster image creation' },
        { title: 'Maximum deep research and agent mode' },
        { title: 'Maximum memory and context' },
        { title: 'Research preview of new features' },
      ],
    },
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'Claude.Color',
    included: {
      productName: 'Claude Pro',
      features: [
        { title: 'Chat on web, iOS, Android, and desktop' },
        { title: 'Generate code and visualize data' },
        { title: 'Extended thinking for complex work' },
        { title: 'Claude Code directly in your codebase' },
        { title: 'Power through tasks with Cowork' },
        { title: 'Higher usage limits' },
        { title: 'Memory that carries across conversations' },
      ],
    },
    upgrade: {
      productName: 'Claude Max',
      price: 8888,
      features: [
        { title: 'Up to 20x more usage than Pro' },
        { title: 'Recommended for Claude Code & Cowork' },
        { title: 'Early access to advanced Claude features' },
        { title: 'Higher output limits for all tasks' },
        { title: 'Priority access at high traffic times' },
      ],
    },
  },
  {
    id: 'google',
    name: 'Google',
    icon: 'Gemini.Color',
    included: {
      productName: 'Google AI Pro',
      features: [
        {
          title: '4x higher usage limits',
          detail: 'Get usage limits that are 4x higher than without a Google AI plan',
        },
        {
          title: 'Access to our Pro model',
          detail:
            'Get the advanced reasoning of our Gemini 3 Pro model for complex math and coding problems',
        },
        {
          title: 'Access Deep Research and more features',
          detail: 'Get access to more advanced features like Deep Research',
        },
      ],
    },
    upgrade: {
      productName: 'Google AI Ultra',
      price: 8888,
      features: [
        {
          title: '5x higher usage limits than Pro plan',
          detail: 'Get usage limits that are 5x higher than the Google AI Pro plan',
        },
        {
          title: 'Higher access to our Pro model',
          detail:
            'Get the advanced reasoning of our Gemini 3 Pro model for complex math and coding problems',
        },
        {
          title: 'Access Deep Think and more features',
          detail: 'Get access to our most advanced features like Deep Think',
        },
      ],
    },
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
