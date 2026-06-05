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
import { STORAGE_KEYS } from '../constants'
import {
  DEFAULT_COMPARE_CONFIG,
  DEFAULT_CONFIG,
  DEFAULT_PARAMETER_ENABLED,
} from '../constants'
import type {
  CompareRound,
  Message,
  ParameterEnabled,
  PlaygroundConfig,
  PlaygroundSession,
} from '../types'
import { sanitizeMessagesOnLoad } from './message-utils'

const MAX_SESSIONS = 50

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function titleFromMessages(messages: Message[]): string {
  const firstUser = messages.find((message) => message.from === 'user')
  const content = firstUser?.versions?.[0]?.content?.trim()
  if (!content) return 'New session'
  return content.length > 48 ? `${content.slice(0, 48)}...` : content
}

function titleFromCompareRounds(rounds: CompareRound[]): string {
  const prompt = rounds[0]?.prompt?.trim()
  if (!prompt) return 'New session'
  return prompt.length > 48 ? `${prompt.slice(0, 48)}...` : prompt
}

export function createDefaultSession(
  overrides: Partial<PlaygroundSession> = {}
): PlaygroundSession {
  const now = Date.now()
  return {
    id: generateId(),
    title: 'New session',
    mode: 'chat',
    config: DEFAULT_CONFIG,
    parameterEnabled: DEFAULT_PARAMETER_ENABLED,
    messages: [],
    compareRounds: [],
    compareConfig: DEFAULT_COMPARE_CONFIG,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function normalizeSession(raw: Partial<PlaygroundSession>): PlaygroundSession {
  const messages = Array.isArray(raw.messages)
    ? sanitizeMessagesOnLoad(raw.messages)
    : []
  const compareRounds = Array.isArray(raw.compareRounds)
    ? raw.compareRounds
    : []
  return createDefaultSession({
    id: typeof raw.id === 'string' && raw.id ? raw.id : generateId(),
    title:
      typeof raw.title === 'string' && raw.title.trim()
        ? raw.title
        : messages.length > 0
          ? titleFromMessages(messages)
          : titleFromCompareRounds(compareRounds),
    mode: raw.mode === 'compare' ? 'compare' : 'chat',
    config: { ...DEFAULT_CONFIG, ...(raw.config ?? {}) },
    parameterEnabled: {
      ...DEFAULT_PARAMETER_ENABLED,
      ...(raw.parameterEnabled ?? {}),
    },
    messages,
    compareRounds,
    compareConfig: {
      ...DEFAULT_COMPARE_CONFIG,
      ...(raw.compareConfig ?? {}),
      selectedModelIds:
        raw.compareConfig?.selectedModelIds?.length === 3
          ? raw.compareConfig.selectedModelIds
          : DEFAULT_COMPARE_CONFIG.selectedModelIds,
    },
    createdAt:
      typeof raw.createdAt === 'number' && raw.createdAt > 0
        ? raw.createdAt
        : 0,
    updatedAt:
      typeof raw.updatedAt === 'number' && raw.updatedAt > 0
        ? raw.updatedAt
        : 0,
  })
}

/**
 * Load playground config from localStorage
 */
export function loadConfig(): Partial<PlaygroundConfig> {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load config:', error)
  }
  return {}
}

/**
 * Save playground config to localStorage
 */
export function saveConfig(config: Partial<PlaygroundConfig>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save config:', error)
  }
}

/**
 * Load parameter enabled state from localStorage
 */
export function loadParameterEnabled(): Partial<ParameterEnabled> {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PARAMETER_ENABLED)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load parameter enabled:', error)
  }
  return {}
}

/**
 * Save parameter enabled state to localStorage
 */
export function saveParameterEnabled(
  parameterEnabled: Partial<ParameterEnabled>
): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.PARAMETER_ENABLED,
      JSON.stringify(parameterEnabled)
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save parameter enabled:', error)
  }
}

/**
 * Load messages from localStorage
 */
export function loadMessages(): Message[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (!Array.isArray(parsed)) {
        return null
      }
      const sanitized = sanitizeMessagesOnLoad(parsed as Message[])
      // Persist sanitized result to avoid re-sanitizing on subsequent loads
      if (sanitized !== parsed) {
        saveMessages(sanitized)
      }
      return sanitized
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load messages:', error)
  }
  return null
}

/**
 * Save messages to localStorage
 */
export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save messages:', error)
  }
}

/**
 * Clear all playground data
 */
export function clearPlaygroundData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFIG)
    localStorage.removeItem(STORAGE_KEYS.PARAMETER_ENABLED)
    localStorage.removeItem(STORAGE_KEYS.MESSAGES)
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear playground data:', error)
  }
}

function loadLegacyCompareRounds(): CompareRound[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LEGACY_COMPARE_ROUNDS)
    if (!saved) return []
    const parsed = JSON.parse(saved) as Array<{
      id?: string
      prompt?: string
      results?: Array<{
        modelId?: string
        modelName?: string
        status?: string
        answerFull?: string
        answerPreview?: string
        errorMessage?: string
        responseTimeMs?: number
        useTimeMs?: number | null
        promptTokens?: number
        completionTokens?: number
        totalTokens?: number
        quotaRaw?: number | null
      }>
    }>
    if (!Array.isArray(parsed)) return []
    return parsed.map((round) => ({
      id: round.id || generateId(),
      prompt: round.prompt || '',
      createdAt: Number(round.id) || Date.now(),
      results: Array.isArray(round.results)
        ? round.results.map((result) => ({
            id: `${round.id || generateId()}-${result.modelId || generateId()}`,
            modelId: result.modelId || '',
            modelName: result.modelName || result.modelId || '',
            status:
              result.status === 'loading'
                ? 'error'
                : result.status === 'error'
                  ? 'error'
                  : 'done',
            content: result.answerFull || result.answerPreview || '',
            errorMessage:
              result.status === 'loading'
                ? 'Request was interrupted'
                : result.errorMessage,
            metrics: {
              responseTimeMs: result.responseTimeMs,
              useTimeMs: result.useTimeMs,
              promptTokens: result.promptTokens,
              completionTokens: result.completionTokens,
              totalTokens: result.totalTokens,
              quotaRaw: result.quotaRaw,
            },
          }))
        : [],
    }))
  } catch {
    return []
  }
}

function loadLegacySession(): PlaygroundSession {
  const config = { ...DEFAULT_CONFIG, ...loadConfig() }
  const parameterEnabled = {
    ...DEFAULT_PARAMETER_ENABLED,
    ...loadParameterEnabled(),
  }
  const messages = loadMessages() || []
  const compareRounds = loadLegacyCompareRounds()
  const mode =
    compareRounds.length > 0 && messages.length === 0 ? 'compare' : 'chat'
  return createDefaultSession({
    title:
      messages.length > 0
        ? titleFromMessages(messages)
        : titleFromCompareRounds(compareRounds),
    mode,
    config,
    parameterEnabled,
    messages,
    compareRounds,
  })
}

export function loadSessions(): PlaygroundSession[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<PlaygroundSession>[]
      if (Array.isArray(parsed)) {
        const sessions = parsed.map(normalizeSession).slice(-MAX_SESSIONS)
        return sessions.length > 0 ? sessions : [createDefaultSession()]
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load Model Lab sessions:', error)
  }

  const legacySession = loadLegacySession()
  return [legacySession]
}

export function saveSessions(sessions: PlaygroundSession[]): void {
  try {
    const nonEmptySessions = sessions.filter(
      (s) => s.messages.length > 0 || s.compareRounds.length > 0
    )
    localStorage.setItem(
      STORAGE_KEYS.SESSIONS,
      JSON.stringify(nonEmptySessions.slice(-MAX_SESSIONS))
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save Model Lab sessions:', error)
  }
}

export function loadActiveSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION)
  } catch {
    return null
  }
}

export function saveActiveSessionId(sessionId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, sessionId)
  } catch {
    // Ignore storage errors.
  }
}
