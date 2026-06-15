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
import { useCallback, useRef, useState } from 'react'
import { SSE } from 'sse.js'
import { getCommonHeaders } from '@/lib/api'
import { fetchRequestMetrics } from '../api'
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants'
import { getWebSearchSupport } from '../lib/web-search-support'
import type {
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionRequest,
  CompareRound,
  CompareResult,
  ModelOption,
  ParameterEnabled,
  PlaygroundConfig,
  ResponseMetrics,
  ContentPart,
} from '../types'

interface UseCompareHandlerOptions {
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  rounds: CompareRound[]
  onRoundsUpdate: (
    updater: CompareRound[] | ((prev: CompareRound[]) => CompareRound[])
  ) => void
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function formatComparePromptMessage(
  prompt: string,
  files?: any[]
): ChatCompletionMessage {
  if (files && files.length > 0) {
    const parts: ContentPart[] = []
    if (prompt) {
      parts.push({ type: 'text', text: prompt })
    }
    files.forEach((file) => {
      if (file.mediaType?.startsWith('image/')) {
        parts.push({
          type: 'image_url',
          image_url: { url: file.url },
        })
      } else {
        parts.push({
          type: 'file',
          file: {
            filename: file.filename || '',
            file_data: file.url,
          },
        })
      }
    })
    return { role: 'user', content: parts }
  }
  return { role: 'user', content: prompt }
}

function buildContextMessages(
  rounds: CompareRound[],
  modelId: string,
  prompt: string,
  currentFiles?: any[]
): ChatCompletionMessage[] {
  const messages: ChatCompletionMessage[] = []
  rounds.forEach((round) => {
    const result = round.results.find((item) => item.modelId === modelId)
    if (!result || result.status === 'error') return
    messages.push(formatComparePromptMessage(round.prompt, round.files))
    if (result.content.trim()) {
      messages.push({ role: 'assistant', content: result.content })
    }
  })
  messages.push(formatComparePromptMessage(prompt, currentFiles))
  return messages
}

function buildPayload(
  model: ModelOption,
  messages: ChatCompletionMessage[],
  config: PlaygroundConfig,
  parameterEnabled: ParameterEnabled
): ChatCompletionRequest {
  const payload: ChatCompletionRequest = {
    model: model.value,
    group: config.group,
    messages,
    stream: true,
    stream_options: { include_usage: true },
  }

  const parameterKeys: Array<keyof ParameterEnabled> = [
    'temperature',
    'top_p',
    'max_tokens',
    'frequency_penalty',
    'presence_penalty',
    'seed',
  ]

  parameterKeys.forEach((key) => {
    if (!parameterEnabled[key]) return
    const value = config[key as keyof PlaygroundConfig]
    if (value !== undefined && value !== null) {
      ;(payload as unknown as Record<string, unknown>)[key] = value
    }
  })

  // Web search per compared model: only send web_search_options when this
  // model's relay path can translate it ('builtin' models search regardless
  // and may reject the unknown parameter; 'unsupported' models are skipped).
  if (config.web_search && getWebSearchSupport(model) === 'supported') {
    payload.web_search_options = {}
  }

  return payload
}

export function useCompareHandler({
  config,
  parameterEnabled,
  rounds,
  onRoundsUpdate,
}: UseCompareHandlerOptions) {
  const streamsRef = useRef<Map<string, SSE>>(new Map())
  const [activeCount, setActiveCount] = useState(0)

  const patchResult = useCallback(
    (
      roundId: string,
      resultId: string,
      updater: (result: CompareResult) => CompareResult
    ) => {
      onRoundsUpdate((prev) =>
        prev.map((round) =>
          round.id !== roundId
            ? round
            : {
                ...round,
                results: round.results.map((result) =>
                  result.id === resultId ? updater(result) : result
                ),
              }
        )
      )
    },
    [onRoundsUpdate]
  )

  const finishStream = useCallback((resultId: string) => {
    streamsRef.current.delete(resultId)
    setActiveCount(streamsRef.current.size)
  }, [])

  const sendCompare = useCallback(
    (prompt: string, selectedModels: ModelOption[], files?: any[]) => {
      const trimmed = prompt.trim()
      const hasAttachments = files && files.length > 0
      if (
        (!trimmed && !hasAttachments) ||
        selectedModels.length !== 3 ||
        streamsRef.current.size > 0
      ) {
        return
      }

      const roundId = createId()
      const createdAt = Date.now()
      const initialResults: CompareResult[] = selectedModels.map((model) => ({
        id: `${roundId}-${model.value}`,
        modelId: model.value,
        modelName: model.label,
        status: 'loading',
        content: '',
        metrics: {},
      }))

      onRoundsUpdate((prev) => [
        ...prev,
        {
          id: roundId,
          prompt: trimmed,
          results: initialResults,
          createdAt,
          files,
        },
      ])

      selectedModels.forEach((model) => {
        const resultId = `${roundId}-${model.value}`
        const payload = buildPayload(
          model,
          buildContextMessages(rounds, model.value, trimmed, files),
          config,
          parameterEnabled
        )
        const startedAt = Date.now()
        const metrics: ResponseMetrics = {}

        const source = new SSE(API_ENDPOINTS.CHAT_COMPLETIONS, {
          headers: getCommonHeaders(),
          method: 'POST',
          payload: JSON.stringify(payload),
        })
        let streamDone = false
        let streamClosed = false
        let pendingContent = ''
        let pendingReasoning = ''
        let pendingMetrics = false
        let pendingFrame: number | null = null

        const flushPending = () => {
          pendingFrame = null
          if (!pendingContent && !pendingReasoning && !pendingMetrics) return

          const content = pendingContent
          const reasoning = pendingReasoning
          pendingContent = ''
          pendingReasoning = ''
          pendingMetrics = false

          patchResult(roundId, resultId, (result) => ({
            ...result,
            status: 'streaming',
            content: result.content + content,
            reasoning:
              reasoning || result.reasoning
                ? `${result.reasoning || ''}${reasoning}`
                : undefined,
            metrics: { ...result.metrics, ...metrics },
          }))
        }

        const schedulePendingFlush = () => {
          if (pendingFrame !== null) return
          pendingFrame = window.requestAnimationFrame(flushPending)
        }

        const close = () => {
          streamClosed = true
          if (pendingFrame !== null) {
            window.cancelAnimationFrame(pendingFrame)
            pendingFrame = null
          }
          source.close()
          finishStream(resultId)
        }

        source.addEventListener(
          'open',
          (
            e: Event & {
              headers?: Record<string, string[]>
            }
          ) => {
            const requestId = e.headers?.['x-oneapi-request-id']?.[0]
            if (!requestId) return
            metrics.requestId = requestId
            patchResult(roundId, resultId, (result) => ({
              ...result,
              metrics: { ...result.metrics, requestId },
            }))
          }
        )

        source.addEventListener('message', (event: MessageEvent) => {
          if (event.data === '[DONE]') {
            streamDone = true
            flushPending()
            metrics.responseTimeMs = Date.now() - startedAt
            patchResult(roundId, resultId, (result) => ({
              ...result,
              status: 'done',
              metrics: { ...result.metrics, ...metrics },
            }))
            close()
            if (metrics.requestId) {
              void fetchRequestMetrics(metrics.requestId).then((logMetrics) => {
                if (!logMetrics) return
                patchResult(roundId, resultId, (result) => ({
                  ...result,
                  metrics: { ...result.metrics, ...metrics, ...logMetrics },
                }))
              })
            }
            return
          }

          try {
            const chunk = JSON.parse(event.data) as ChatCompletionChunk
            const delta = chunk.choices?.[0]?.delta
            if (chunk.usage) {
              metrics.promptTokens = chunk.usage.prompt_tokens
              metrics.completionTokens = chunk.usage.completion_tokens
              metrics.totalTokens = chunk.usage.total_tokens
              pendingMetrics = true
            }
            if (!delta?.content && !delta?.reasoning_content && !chunk.usage) {
              return
            }

            pendingContent += delta?.content || ''
            pendingReasoning += delta?.reasoning_content || ''
            schedulePendingFlush()
          } catch {
            patchResult(roundId, resultId, (result) => ({
              ...result,
              status: 'error',
              errorMessage: ERROR_MESSAGES.PARSE_ERROR,
            }))
            close()
          }
        })

        source.addEventListener('error', (event: Event & { data?: string }) => {
          if (
            streamDone ||
            streamClosed ||
            (source as unknown as { readyState?: number }).readyState === 2
          ) {
            return
          }

          let errorMessage = event.data || ERROR_MESSAGES.API_REQUEST_ERROR
          try {
            const parsed = event.data
              ? (JSON.parse(event.data) as {
                  error?: { message?: string }
                })
              : null
            errorMessage = parsed?.error?.message || errorMessage
          } catch {
            // Use raw error text.
          }
          metrics.responseTimeMs = Date.now() - startedAt
          patchResult(roundId, resultId, (result) => ({
            ...result,
            status: 'error',
            errorMessage,
            metrics: { ...result.metrics, ...metrics },
          }))
          close()
        })

        streamsRef.current.set(resultId, source)
        setActiveCount(streamsRef.current.size)
        source.stream()
      })
    },
    [
      config,
      finishStream,
      onRoundsUpdate,
      parameterEnabled,
      patchResult,
      rounds,
    ]
  )

  const stopCompare = useCallback(() => {
    const activeIds = Array.from(streamsRef.current.keys())
    streamsRef.current.forEach((source) => source.close())
    streamsRef.current.clear()
    setActiveCount(0)
    onRoundsUpdate((prev) =>
      prev.map((round) => ({
        ...round,
        results: round.results.map((result) =>
          activeIds.includes(result.id) &&
          (result.status === 'loading' || result.status === 'streaming')
            ? { ...result, status: 'done' }
            : result
        ),
      }))
    )
  }, [onRoundsUpdate])

  return {
    sendCompare,
    stopCompare,
    isComparing: activeCount > 0,
  }
}
