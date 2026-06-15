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
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Columns2,
  FlaskConicalIcon,
  MessagesSquareIcon,
  PanelLeft,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { getUserModels, getUserGroups } from './api'
import { ComparePanel } from './components/compare-panel'
import { PlaygroundChat } from './components/playground-chat'
import { PlaygroundInput } from './components/playground-input'
import { SessionHistory } from './components/session-history'
import {
  usePlaygroundState,
  useChatHandler,
  useCompareHandler,
  useCompareEvaluation,
} from './hooks'
import {
  createUserMessage,
  createLoadingAssistantMessage,
  getWebSearchSupport,
} from './lib'
import type { Message as MessageType, PlaygroundMode } from './types'

export function Playground() {
  const { t } = useTranslation()
  const {
    config,
    parameterEnabled,
    messages,
    mode,
    sessions,
    activeSessionId,
    compareConfig,
    compareRounds,
    models,
    groups,
    updateMode,
    updateMessages,
    updateCompareConfig,
    updateCompareRounds,
    setModels,
    setGroups,
    updateConfig,
    createSession,
    startNewSession,
    switchSession,
    renameSession,
    deleteSession,
    clearSessions,
  } = usePlaygroundState()

  // Web search support for the currently selected chat model
  const webSearchSupport = useMemo(
    () =>
      getWebSearchSupport(
        models.find((m) => m.value === config.model),
        config.model
      ),
    [models, config.model]
  )
  const toggleWebSearch = useCallback(
    () => updateConfig('web_search', !config.web_search),
    [updateConfig, config.web_search]
  )

  const { sendChat, stopGeneration, isGenerating } = useChatHandler({
    config,
    parameterEnabled,
    webSearchSupport,
    onMessageUpdate: updateMessages,
  })
  const { sendCompare, stopCompare, isComparing } = useCompareHandler({
    config,
    parameterEnabled,
    rounds: compareRounds,
    onRoundsUpdate: updateCompareRounds,
  })

  const { playgroundEvaluationEnabled } = useSystemConfig()
  const { evaluateRound, stopEvaluation, isEvaluating } = useCompareEvaluation({
    group: config.group,
    onRoundsUpdate: updateCompareRounds,
  })

  // Evaluation targets the latest round; it must be complete with 3 responses.
  const latestRound = compareRounds[compareRounds.length - 1]
  const canEvaluate =
    !!latestRound &&
    latestRound.results.length === 3 &&
    latestRound.results.every(
      (result) => result.status === 'done' && result.content.trim()
    )
  const handleEvaluate = useCallback(() => {
    const round = compareRounds[compareRounds.length - 1]
    if (round) evaluateRound(round)
  }, [compareRounds, evaluateRound])

  // Sidebar collapsible state. On phones the sidebar is an overlay drawer, so
  // default it closed to avoid covering content on load; desktop keeps the
  // saved preference.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches
    ) {
      return false
    }
    const saved = localStorage.getItem('model_lab_sidebar_open')
    return saved !== 'false'
  })

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev
      localStorage.setItem('model_lab_sidebar_open', String(next))
      return next
    })
  }, [])

  // The drawer overlays content on phones, so dismiss it after picking or
  // creating a session there.
  const closeSidebarOnMobile = useCallback(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setSidebarOpen(false)
    }
  }, [])

  const handleSwitchSession = useCallback(
    (sessionId: string) => {
      switchSession(sessionId)
      closeSidebarOnMobile()
    },
    [switchSession, closeSidebarOnMobile]
  )

  const handleCreateSession = useCallback(
    (sessionMode?: PlaygroundMode) => {
      createSession(sessionMode)
      closeSidebarOnMobile()
    },
    [createSession, closeSidebarOnMobile]
  )

  // Edit dialog state
  const [editingMessageKey, setEditingMessageKey] = useState<string | null>(
    null
  )

  // Load models
  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
    queryKey: ['playground-models'],
    queryFn: async () => {
      try {
        return await getUserModels()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t('Failed to load playground models')
        )
        return []
      }
    },
  })

  // Load groups
  const { data: groupsData } = useQuery({
    queryKey: ['playground-groups'],
    queryFn: async () => {
      try {
        return await getUserGroups()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t('Failed to load playground groups')
        )
        return []
      }
    },
  })

  // Update models when data changes
  useEffect(() => {
    if (!modelsData) return

    setModels(modelsData)

    // Set default model if current model is not available
    const isCurrentModelValid = modelsData.some((m) => m.value === config.model)
    if (modelsData.length > 0 && !isCurrentModelValid) {
      updateConfig('model', modelsData[0].value)
    }
    const validCompareIds = compareConfig.selectedModelIds.filter((id) =>
      modelsData.some((model) => model.value === id)
    )
    if (validCompareIds.length !== compareConfig.selectedModelIds.length) {
      updateCompareConfig('selectedModelIds', validCompareIds)
    }
  }, [
    modelsData,
    config.model,
    compareConfig.selectedModelIds,
    setModels,
    updateConfig,
    updateCompareConfig,
  ])

  // Auto-disable web search when switching to a chat model that doesn't support it
  useEffect(() => {
    if (mode !== 'chat') return
    if (config.web_search && webSearchSupport === 'unsupported') {
      updateConfig('web_search', false)
    }
  }, [mode, config.web_search, webSearchSupport, updateConfig])

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryMode = params.get('mode')
    startNewSession(queryMode === 'compare' ? 'compare' : 'chat')
    // Run only on mount; subsequent mode changes are handled by the tabs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('mode') !== mode) {
      url.searchParams.set('mode', mode)
      window.history.replaceState(null, '', url)
    }
  }, [mode])

  // Update groups when data changes
  useEffect(() => {
    if (!groupsData) return

    setGroups(groupsData)

    const hasCurrentGroup = groupsData.some((g) => g.value === config.group)
    if (!hasCurrentGroup && groupsData.length > 0) {
      const fallback =
        groupsData.find((g) => g.value === 'default')?.value ??
        groupsData[0].value
      updateConfig('group', fallback)
    }
  }, [groupsData, setGroups, config.group, updateConfig])

  const handleSendMessage = (message: PromptInputMessage) => {
    const userMessage = createUserMessage(message.text || '', message.files)
    const assistantMessage = createLoadingAssistantMessage()

    const newMessages = [...messages, userMessage, assistantMessage]
    updateMessages(newMessages)

    // Send chat request
    sendChat(newMessages)
  }

  const handleCopyMessage = (message: MessageType) => {
    // Copy is handled in MessageActions component
    // eslint-disable-next-line no-console
    console.log('Message copied:', message.key)
  }

  const handleRegenerateMessage = (message: MessageType) => {
    // Find the message index and regenerate from there
    const messageIndex = messages.findIndex((m) => m.key === message.key)
    if (messageIndex === -1) return

    // Remove messages after this one and regenerate
    const messagesUpToHere = messages.slice(0, messageIndex)
    const loadingMessage = createLoadingAssistantMessage()
    const newMessages = [...messagesUpToHere, loadingMessage]

    updateMessages(newMessages)
    sendChat(newMessages)
  }

  const handleEditMessage = useCallback((message: MessageType) => {
    setEditingMessageKey(message.key)
  }, [])

  const handleEditOpenChange = useCallback((open: boolean) => {
    if (!open) setEditingMessageKey(null)
  }, [])

  // Apply edit and optionally re-submit from the edited user message
  const applyEdit = useCallback(
    (newContent: string, submit: boolean) => {
      if (!editingMessageKey) return
      const index = messages.findIndex((m) => m.key === editingMessageKey)
      if (index === -1) return

      const updated = messages.map((m) =>
        m.key === editingMessageKey
          ? { ...m, versions: [{ ...m.versions[0], content: newContent }] }
          : m
      )

      setEditingMessageKey(null)

      if (!submit || updated[index].from !== 'user') {
        updateMessages(updated)
        return
      }

      const toSubmit = [
        ...updated.slice(0, index + 1),
        createLoadingAssistantMessage(),
      ]
      updateMessages(toSubmit)
      sendChat(toSubmit)
    },
    [editingMessageKey, messages, updateMessages, sendChat]
  )

  const handleDeleteMessage = (message: MessageType) => {
    const newMessages = messages.filter((m) => m.key !== message.key)
    updateMessages(newMessages)
  }

  const handleModeChange = (value: string) => {
    const nextMode = value === 'compare' ? 'compare' : 'chat'
    updateMode(nextMode)
    const url = new URL(window.location.href)
    url.searchParams.set('mode', nextMode)
    window.history.replaceState(null, '', url)
  }

  const isSessionEmpty = messages.length === 0 && compareRounds.length === 0

  return (
    <div className='relative flex size-full overflow-hidden'>
      <SessionHistory
        sessions={sessions}
        activeSessionId={activeSessionId}
        onCreateSession={handleCreateSession}
        onSwitchSession={handleSwitchSession}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        onClearSessions={clearSessions}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {sidebarOpen && (
        <button
          type='button'
          aria-label={t('Close sidebar')}
          className='absolute inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden'
          onClick={toggleSidebar}
        />
      )}

      <div
        className={cn('relative flex min-w-0 flex-1 flex-col overflow-hidden')}
      >
        {!sidebarOpen && (
          <Button
            aria-label={t('Expand sidebar')}
            size='icon'
            variant='ghost'
            className='bg-background/95 hover:bg-accent absolute top-3 left-2 z-10 flex size-8 rounded-md border shadow-sm'
            onClick={toggleSidebar}
          >
            <PanelLeft className='size-4' />
          </Button>
        )}

        {mode === 'compare' ? (
          <ComparePanel
            rounds={compareRounds}
            models={models}
            groups={groups}
            groupValue={config.group}
            onGroupChange={(value) => updateConfig('group', value)}
            compareConfig={compareConfig}
            onCompareConfigChange={updateCompareConfig}
            onRoundsChange={updateCompareRounds}
            isComparing={isComparing}
            onSend={sendCompare}
            onStop={stopCompare}
            mode={mode}
            onModeChange={handleModeChange}
            webSearchEnabled={config.web_search}
            onWebSearchToggle={toggleWebSearch}
            evaluationEnabled={!!playgroundEvaluationEnabled}
            canEvaluate={canEvaluate}
            isEvaluating={isEvaluating}
            onEvaluate={handleEvaluate}
            onStopEvaluation={stopEvaluation}
          />
        ) : isSessionEmpty ? (
          <div className='relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto p-4 md:p-8'>
            {/* Brand Logo & Title */}
            <div className='mb-6 flex flex-col items-center gap-2 text-center select-none'>
              <div className='bg-muted flex size-12 items-center justify-center rounded-2xl'>
                <FlaskConicalIcon className='text-foreground size-6' />
              </div>
              <h2 className='mt-2 text-2xl font-bold tracking-tight'>
                {t('Model Lab')}
              </h2>
              <p className='text-muted-foreground max-w-sm text-sm'>
                {t('Chat with models and compare responses side by side.')}
              </p>
            </div>

            {/* Chat/Compare Toggle */}
            <div className='mb-6'>
              <Tabs value={mode} onValueChange={handleModeChange}>
                <TabsList className='bg-muted grid h-9 w-60 grid-cols-2 rounded-lg p-1'>
                  <TabsTrigger
                    value='chat'
                    className='w-full text-xs font-medium'
                  >
                    <MessagesSquareIcon className='mr-1.5 size-3.5' />
                    {t('Chat')}
                  </TabsTrigger>
                  <TabsTrigger
                    value='compare'
                    className='w-full text-xs font-medium'
                  >
                    <Columns2 className='mr-1.5 size-3.5' />
                    {t('Compare')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Input Bar (Centered) */}
            <div
              className='mx-auto w-full min-w-0 shrink-0 sm:max-w-4xl'
              style={{ maxWidth: 'min(56rem, calc(100dvw - 2rem))' }}
            >
              <PlaygroundInput
                disabled={isGenerating}
                groups={groups}
                groupValue={config.group}
                initialView
                isGenerating={isGenerating}
                isModelLoading={isLoadingModels}
                modelValue={config.model}
                models={models}
                onGroupChange={(value) => updateConfig('group', value)}
                onModelChange={(value) => updateConfig('model', value)}
                onStop={stopGeneration}
                onSubmit={handleSendMessage}
                webSearchEnabled={config.web_search}
                webSearchSupport={webSearchSupport}
                onWebSearchToggle={toggleWebSearch}
              />
            </div>
          </div>
        ) : (
          <>
            <div className='flex flex-1 flex-col overflow-hidden'>
              <PlaygroundChat
                messages={messages}
                onCopyMessage={handleCopyMessage}
                onRegenerateMessage={handleRegenerateMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                isGenerating={isGenerating}
                editingKey={editingMessageKey}
                onCancelEdit={handleEditOpenChange}
                onSaveEdit={(newContent) => applyEdit(newContent, false)}
                onSaveEditAndSubmit={(newContent) =>
                  applyEdit(newContent, true)
                }
              />
            </div>

            <div className='mx-auto w-full max-w-4xl'>
              <PlaygroundInput
                disabled={isGenerating}
                groups={groups}
                groupValue={config.group}
                isGenerating={isGenerating}
                isModelLoading={isLoadingModels}
                modelValue={config.model}
                models={models}
                onGroupChange={(value) => updateConfig('group', value)}
                onModelChange={(value) => updateConfig('model', value)}
                onStop={stopGeneration}
                onSubmit={handleSendMessage}
                webSearchEnabled={config.web_search}
                webSearchSupport={webSearchSupport}
                onWebSearchToggle={toggleWebSearch}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
