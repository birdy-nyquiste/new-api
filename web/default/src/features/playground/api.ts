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
  const res = await api.get(API_ENDPOINTS.USER_MODELS)
  const { data } = res

  if (!data.success || !Array.isArray(data.data)) {
    return []
  }

  return data.data.map((model: string) => ({
    label: model,
    value: model,
  }))
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
