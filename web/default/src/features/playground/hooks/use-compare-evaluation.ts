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
import type {
  ChatCompletionChunk,
  CompareEvaluation,
  CompareRound,
  ResponseMetrics,
} from '../types'

interface UseCompareEvaluationOptions {
  group: string
  onRoundsUpdate: (
    updater: CompareRound[] | ((prev: CompareRound[]) => CompareRound[])
  ) => void
}

// The evaluation prompt is assembled server-side from the admin-configured
// judge model and prompt; the client only sends the round's question and
// the three responses (in column order).
export function useCompareEvaluation({
  group,
  onRoundsUpdate,
}: UseCompareEvaluationOptions) {
  const streamRef = useRef<SSE | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const patchEvaluation = useCallback(
    (
      roundId: string,
      updater: (evaluation: CompareEvaluation) => CompareEvaluation
    ) => {
      onRoundsUpdate((prev) =>
        prev.map((round) =>
          round.id !== roundId || !round.evaluation
            ? round
            : { ...round, evaluation: updater(round.evaluation) }
        )
      )
    },
    [onRoundsUpdate]
  )

  const evaluateRound = useCallback(
    (round: CompareRound) => {
      if (streamRef.current) return
      if (round.results.length !== 3) return
      if (round.results.some((result) => result.status !== 'done')) return
      if (round.results.some((result) => !result.content.trim())) return

      const evaluation: CompareEvaluation = {
        id: `${round.id}-evaluation-${Date.now()}`,
        status: 'loading',
        content: '',
        createdAt: Date.now(),
      }
      // Replace any previous evaluation of this round
      onRoundsUpdate((prev) =>
        prev.map((item) =>
          item.id === round.id ? { ...item, evaluation } : item
        )
      )

      const payload = {
        group,
        question: round.prompt,
        responses: round.results.map((result) => result.content),
      }
      const startedAt = Date.now()
      const metrics: ResponseMetrics = {}

      const source = new SSE(API_ENDPOINTS.COMPARE_EVALUATE, {
        headers: getCommonHeaders(),
        method: 'POST',
        payload: JSON.stringify(payload),
      })

      const close = () => {
        source.close()
        streamRef.current = null
        setIsEvaluating(false)
      }

      source.addEventListener(
        'open',
        (e: Event & { headers?: Record<string, string[]> }) => {
          const requestId = e.headers?.['x-oneapi-request-id']?.[0]
          if (!requestId) return
          metrics.requestId = requestId
          patchEvaluation(round.id, (item) => ({
            ...item,
            metrics: { ...item.metrics, requestId },
          }))
        }
      )

      source.addEventListener('message', (event: MessageEvent) => {
        if (event.data === '[DONE]') {
          metrics.responseTimeMs = Date.now() - startedAt
          patchEvaluation(round.id, (item) => ({
            ...item,
            status: 'done',
            metrics: { ...item.metrics, ...metrics },
          }))
          close()
          if (metrics.requestId) {
            void fetchRequestMetrics(metrics.requestId).then((logMetrics) => {
              if (!logMetrics) return
              patchEvaluation(round.id, (item) => ({
                ...item,
                metrics: { ...item.metrics, ...metrics, ...logMetrics },
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
          }
          if (!delta?.content && !delta?.reasoning_content && !chunk.usage) {
            return
          }

          patchEvaluation(round.id, (item) => ({
            ...item,
            status: 'streaming',
            content: item.content + (delta?.content || ''),
            reasoning:
              delta?.reasoning_content || item.reasoning
                ? `${item.reasoning || ''}${delta?.reasoning_content || ''}`
                : undefined,
            metrics: { ...item.metrics, ...metrics },
          }))
        } catch {
          patchEvaluation(round.id, (item) => ({
            ...item,
            status: 'error',
            errorMessage: ERROR_MESSAGES.PARSE_ERROR,
          }))
          close()
        }
      })

      source.addEventListener('error', (event: Event & { data?: string }) => {
        let errorMessage = event.data || ERROR_MESSAGES.API_REQUEST_ERROR
        try {
          const parsed = event.data
            ? (JSON.parse(event.data) as { error?: { message?: string } })
            : null
          errorMessage = parsed?.error?.message || errorMessage
        } catch {
          // Use raw error text.
        }
        metrics.responseTimeMs = Date.now() - startedAt
        patchEvaluation(round.id, (item) => ({
          ...item,
          status: 'error',
          errorMessage,
          metrics: { ...item.metrics, ...metrics },
        }))
        close()
      })

      streamRef.current = source
      setIsEvaluating(true)
      source.stream()
    },
    [group, onRoundsUpdate, patchEvaluation]
  )

  const stopEvaluation = useCallback(() => {
    const source = streamRef.current
    if (!source) return
    source.close()
    streamRef.current = null
    setIsEvaluating(false)
    onRoundsUpdate((prev) =>
      prev.map((round) =>
        round.evaluation &&
        (round.evaluation.status === 'loading' ||
          round.evaluation.status === 'streaming')
          ? { ...round, evaluation: { ...round.evaluation, status: 'done' } }
          : round
      )
    )
  }, [onRoundsUpdate])

  return {
    evaluateRound,
    stopEvaluation,
    isEvaluating,
  }
}
