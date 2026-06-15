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
import { useMemo, useState, useCallback } from 'react'
import { DEFAULT_CONFIG, DEFAULT_PARAMETER_ENABLED } from '../constants'
import {
  createDefaultSession,
  loadActiveSessionId,
  loadSessions,
  saveActiveSessionId,
  saveSessions,
} from '../lib'
import type {
  CompareConfig,
  CompareRound,
  Message,
  PlaygroundConfig,
  ParameterEnabled,
  ModelOption,
  GroupOption,
  PlaygroundMode,
  PlaygroundSession,
} from '../types'

function titleFromPrompt(prompt: string) {
  const trimmed = prompt.trim()
  if (!trimmed) return 'New session'
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed
}

function ensureActiveSession(
  sessions: PlaygroundSession[],
  activeSessionId: string | null
) {
  return (
    sessions.find((session) => session.id === activeSessionId) ??
    sessions[0] ??
    createDefaultSession()
  )
}

/**
 * Main state management hook for playground
 */
export function usePlaygroundState() {
  const [sessions, setSessions] = useState<PlaygroundSession[]>(() => {
    const loaded = loadSessions()
    saveSessions(loaded)
    return loaded
  })
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const loadedSessions = loadSessions()
    const savedActive = loadActiveSessionId()
    const active = ensureActiveSession(loadedSessions, savedActive)
    saveActiveSessionId(active.id)
    return active.id
  })
  const [models, setModels] = useState<ModelOption[]>([])
  const [groups, setGroups] = useState<GroupOption[]>([])

  const activeSession = useMemo(
    () => ensureActiveSession(sessions, activeSessionId),
    [sessions, activeSessionId]
  )

  const persistSessions = useCallback(
    (updater: (prev: PlaygroundSession[]) => PlaygroundSession[]) => {
      setSessions((prev) => {
        const updated = updater(prev)
        saveSessions(updated)
        return updated
      })
    },
    []
  )

  const updateActiveSession = useCallback(
    (updater: (session: PlaygroundSession) => PlaygroundSession) => {
      persistSessions((prev) => {
        const current = ensureActiveSession(prev, activeSessionId)
        const hasCurrent = prev.some((session) => session.id === current.id)
        const updatedSession = {
          ...updater(current),
          updatedAt: Date.now(),
        }

        if (!hasCurrent) return [updatedSession]
        return prev.map((session) =>
          session.id === current.id ? updatedSession : session
        )
      })
    },
    [activeSessionId, persistSessions]
  )

  const updateConfig = useCallback(
    <K extends keyof PlaygroundConfig>(key: K, value: PlaygroundConfig[K]) => {
      updateActiveSession((session) => ({
        ...session,
        config: { ...session.config, [key]: value },
      }))
    },
    [updateActiveSession]
  )

  const updateParameterEnabled = useCallback(
    (key: keyof ParameterEnabled, value: boolean) => {
      updateActiveSession((session) => ({
        ...session,
        parameterEnabled: { ...session.parameterEnabled, [key]: value },
      }))
    },
    [updateActiveSession]
  )

  const updateMessages = useCallback(
    (updater: Message[] | ((prev: Message[]) => Message[])) => {
      updateActiveSession((session) => {
        const newMessages =
          typeof updater === 'function' ? updater(session.messages) : updater
        const shouldAutoTitle =
          session.title === 'New session' && newMessages.length > 0
        const firstUser = newMessages.find((message) => message.from === 'user')
        return {
          ...session,
          title:
            shouldAutoTitle && firstUser?.versions?.[0]?.content
              ? titleFromPrompt(firstUser.versions[0].content)
              : session.title,
          messages: newMessages,
        }
      })
    },
    [updateActiveSession]
  )

  const clearMessages = useCallback(() => {
    updateMessages([])
  }, [updateMessages])

  const resetConfig = useCallback(() => {
    updateActiveSession((session) => ({
      ...session,
      config: DEFAULT_CONFIG,
      parameterEnabled: DEFAULT_PARAMETER_ENABLED,
    }))
  }, [updateActiveSession])

  const updateMode = useCallback(
    (mode: PlaygroundMode) => {
      updateActiveSession((session) => ({ ...session, mode }))
    },
    [updateActiveSession]
  )

  const updateCompareConfig = useCallback(
    <K extends keyof CompareConfig>(key: K, value: CompareConfig[K]) => {
      updateActiveSession((session) => ({
        ...session,
        compareConfig: { ...session.compareConfig, [key]: value },
      }))
    },
    [updateActiveSession]
  )

  const updateCompareRounds = useCallback(
    (updater: CompareRound[] | ((prev: CompareRound[]) => CompareRound[])) => {
      updateActiveSession((session) => {
        const compareRounds =
          typeof updater === 'function'
            ? updater(session.compareRounds)
            : updater
        const shouldAutoTitle =
          session.title === 'New session' && compareRounds.length > 0
        return {
          ...session,
          title: shouldAutoTitle
            ? titleFromPrompt(compareRounds[0]?.prompt || '')
            : session.title,
          compareRounds,
        }
      })
    },
    [updateActiveSession]
  )

  const createSession = useCallback(
    (mode: PlaygroundMode = activeSession.mode) => {
      const existingEmpty = sessions.find(
        (s) => s.messages.length === 0 && s.compareRounds.length === 0
      )
      if (existingEmpty) {
        if (existingEmpty.mode !== mode) {
          persistSessions((prev) =>
            prev.map((s) => (s.id === existingEmpty.id ? { ...s, mode } : s))
          )
        }
        setActiveSessionId(existingEmpty.id)
        saveActiveSessionId(existingEmpty.id)
        return existingEmpty.id
      }

      const session = createDefaultSession({ mode })
      persistSessions((prev) => [...prev, session])
      setActiveSessionId(session.id)
      saveActiveSessionId(session.id)
      return session.id
    },
    [activeSession.mode, sessions, persistSessions]
  )

  const startNewSession = useCallback(
    (mode: PlaygroundMode = 'chat') => {
      const session = createDefaultSession({ mode })
      persistSessions((prev) => [...prev, session])
      setActiveSessionId(session.id)
      saveActiveSessionId(session.id)
      return session.id
    },
    [persistSessions]
  )

  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
    saveActiveSessionId(sessionId)
  }, [])

  const renameSession = useCallback(
    (sessionId: string, title: string) => {
      const nextTitle = title.trim()
      if (!nextTitle) return
      persistSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, title: nextTitle, updatedAt: Date.now() }
            : session
        )
      )
    },
    [persistSessions]
  )

  const deleteSession = useCallback(
    (sessionId: string) => {
      persistSessions((prev) => {
        const remaining = prev.filter((session) => session.id !== sessionId)
        const next = remaining.length > 0 ? remaining : [createDefaultSession()]
        if (activeSessionId === sessionId) {
          setActiveSessionId(next[0].id)
          saveActiveSessionId(next[0].id)
        }
        return next
      })
    },
    [activeSessionId, persistSessions]
  )

  const clearSessions = useCallback(() => {
    const session = createDefaultSession()
    setSessions([session])
    saveSessions([session])
    setActiveSessionId(session.id)
    saveActiveSessionId(session.id)
  }, [])

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [sessions])

  return {
    // State
    sessions: sortedSessions,
    activeSessionId,
    activeSession,
    mode: activeSession.mode,
    config: activeSession.config,
    parameterEnabled: activeSession.parameterEnabled,
    messages: activeSession.messages,
    compareConfig: activeSession.compareConfig,
    compareRounds: activeSession.compareRounds,
    models,
    groups,

    // Setters
    setModels,
    setGroups,

    // Actions
    updateConfig,
    updateParameterEnabled,
    updateMessages,
    updateMode,
    updateCompareConfig,
    updateCompareRounds,
    clearMessages,
    resetConfig,
    createSession,
    startNewSession,
    switchSession,
    renameSession,
    deleteSession,
    clearSessions,
  }
}
