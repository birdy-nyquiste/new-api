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
import { api } from '@/lib/api'
import { API_ENDPOINTS } from './constants'
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelOption,
  GroupOption,
  ResponseMetrics,
} from './types'

const LOG_TYPE_CONSUME = 2

type UserModelResponseItem =
  | string
  | {
      label?: unknown
      value?: unknown
      category?: unknown
      categoryIcon?: unknown
    }

type PricingResponse = {
  data?: Array<{
    model_name?: unknown
    vendor_id?: unknown
  }>
  vendors?: Array<{
    id?: unknown
    name?: unknown
    icon?: unknown
  }>
}

type ModelCategoryMeta = {
  name: string
  icon?: string
}

function compareModelOptions(a: ModelOption, b: ModelOption) {
  const categoryCompare = (a.category || '\uffff').localeCompare(
    b.category || '\uffff',
    undefined,
    { sensitivity: 'base' }
  )
  if (categoryCompare !== 0) return categoryCompare
  return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
}

function parseUserModelOptions(data: unknown): ModelOption[] {
  if (!Array.isArray(data)) return []

  return (data as UserModelResponseItem[])
    .map((item) => {
      if (typeof item === 'string') {
        return {
          label: item,
          value: item,
        }
      }

      const value = typeof item.value === 'string' ? item.value : ''
      const label = typeof item.label === 'string' ? item.label : value
      const category =
        typeof item.category === 'string' && item.category.trim()
          ? item.category
          : undefined
      const categoryIcon =
        typeof item.categoryIcon === 'string' && item.categoryIcon.trim()
          ? item.categoryIcon
          : undefined

      return {
        label,
        value,
        category,
        categoryIcon,
      }
    })
    .filter((model) => model.value)
}

function parsePricingModelCategories(data: PricingResponse) {
  const vendors = new Map<number, ModelCategoryMeta>()
  data.vendors?.forEach((vendor) => {
    if (typeof vendor.id !== 'number' || typeof vendor.name !== 'string') {
      return
    }
    vendors.set(vendor.id, {
      name: vendor.name,
      icon: typeof vendor.icon === 'string' ? vendor.icon : undefined,
    })
  })

  const categories = new Map<string, ModelCategoryMeta>()
  data.data?.forEach((model) => {
    if (
      typeof model.model_name !== 'string' ||
      typeof model.vendor_id !== 'number'
    ) {
      return
    }
    const vendor = vendors.get(model.vendor_id)
    if (vendor) {
      categories.set(model.model_name, vendor)
    }
  })
  return categories
}

/**
 * Send chat completion request (non-streaming)
 */
export async function sendChatCompletion(
  payload: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const res = await api.post(API_ENDPOINTS.CHAT_COMPLETIONS, payload, {
    skipErrorHandler: true,
  } as Record<string, unknown>)
  return res.data
}

export async function sendChatCompletionWithMeta(
  payload: ChatCompletionRequest
): Promise<{ data: ChatCompletionResponse; metrics: ResponseMetrics }> {
  const start = Date.now()
  const res = await api.post(API_ENDPOINTS.CHAT_COMPLETIONS, payload, {
    skipErrorHandler: true,
  } as Record<string, unknown>)
  const usage = (res.data as ChatCompletionResponse).usage
  return {
    data: res.data,
    metrics: {
      requestId:
        (res.headers as Record<string, string>)['x-oneapi-request-id'] || '',
      responseTimeMs: Date.now() - start,
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
    },
  }
}

export async function fetchRequestMetrics(
  requestId: string
): Promise<ResponseMetrics | null> {
  if (!requestId) return null

  try {
    const res = await api.get(API_ENDPOINTS.USER_LOGS, {
      params: { request_id: requestId, type: LOG_TYPE_CONSUME, p: 1, size: 1 },
    })
    const item = res.data?.data?.items?.[0] as
      | {
          use_time?: number
          quota?: number
          prompt_tokens?: number
          completion_tokens?: number
          token_used?: number
        }
      | undefined
    if (!item) return null
    return {
      requestId,
      useTimeMs:
        typeof item.use_time === 'number' ? item.use_time * 1000 : null,
      quotaRaw: typeof item.quota === 'number' ? item.quota : null,
      promptTokens:
        typeof item.prompt_tokens === 'number' ? item.prompt_tokens : undefined,
      completionTokens:
        typeof item.completion_tokens === 'number'
          ? item.completion_tokens
          : undefined,
      totalTokens:
        typeof item.token_used === 'number' ? item.token_used : undefined,
    }
  } catch {
    return null
  }
}

/**
 * Get user available models
 */
export async function getUserModels(): Promise<ModelOption[]> {
  const [modelsResult, pricingResult] = await Promise.allSettled([
    api.get(API_ENDPOINTS.USER_MODELS, {
      params: { with_metadata: true },
    }),
    api.get('/api/pricing', {
      skipErrorHandler: true,
    }),
  ])

  if (modelsResult.status !== 'fulfilled') {
    return []
  }

  const { data } = modelsResult.value
  if (!data.success) {
    return []
  }

  const pricingCategories =
    pricingResult.status === 'fulfilled'
      ? parsePricingModelCategories(pricingResult.value.data as PricingResponse)
      : new Map<string, ModelCategoryMeta>()

  return parseUserModelOptions(data.data)
    .map((model) => {
      const pricingCategory = pricingCategories.get(model.value)
      return pricingCategory
        ? {
            ...model,
            category: pricingCategory.name,
            categoryIcon: pricingCategory.icon,
          }
        : model
    })
    .sort(compareModelOptions)
}

/**
 * Get user groups
 */
export async function getUserGroups(): Promise<GroupOption[]> {
  const res = await api.get(API_ENDPOINTS.USER_GROUPS)
  const { data } = res

  if (!data.success || !data.data) {
    return []
  }

  const groupData = data.data as Record<string, { desc: string; ratio: number }>

  // label is for button display (name only); desc is for dropdown content
  return Object.entries(groupData).map(([group, info]) => ({
    label: group,
    value: group,
    ratio: info.ratio,
    desc: info.desc,
  }))
}
