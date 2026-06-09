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
import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Columns2,
  FlaskConicalIcon,
  MessagesSquareIcon,
  PanelLeft,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { getUserModels, getUserGroups } from './api'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { ComparePanel } from './components/compare-panel'
import { PlaygroundChat } from './components/playground-chat'
import { PlaygroundInput } from './components/playground-input'
import { SessionHistory } from './components/session-history'
import { usePlaygroundState, useChatHandler, useCompareHandler } from './hooks'
import { createUserMessage, createLoadingAssistantMessage } from './lib'
import type { Message as MessageType } from './types'

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
    switchSession,
    renameSession,
    deleteSession,
    clearSessions,
  } = usePlaygroundState()

  const { sendChat, stopGeneration, isGenerating } = useChatHandler({
    config,
    parameterEnabled,
    onMessageUpdate: updateMessages,
  })
  const { sendCompare, stopCompare, isComparing } = useCompareHandler({
    config,
    parameterEnabled,
    rounds: compareRounds,
    includeContext: compareConfig.includeContext,
    onRoundsUpdate: updateCompareRounds,
  })

  // Sidebar collapsible state
  const [sidebarOpen, setSidebarOpen] = useState(() => {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryMode = params.get('mode')
    if (queryMode === 'compare' || queryMode === 'chat') {
      updateMode(queryMode)
    }
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
        onCreateSession={createSession}
        onSwitchSession={switchSession}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        onClearSessions={clearSessions}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col overflow-hidden relative',
          !sidebarOpen && 'md:pt-16'
        )}
      >
        {!sidebarOpen && (
          <Button
            aria-label={t('Expand sidebar')}
            size='icon'
            variant='ghost'
            className='absolute top-4 left-4 z-10 hidden size-9 rounded-lg border bg-background shadow-sm hover:bg-accent md:flex'
            onClick={toggleSidebar}
          >
            <PanelLeft className='size-5' />
          </Button>
        )}

        <header className='flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4 md:hidden'>
          <div className='flex min-w-0 items-center gap-3'>
            {!sidebarOpen && (
              <Button
                aria-label={t('Expand sidebar')}
                size='icon'
                variant='ghost'
                className='size-9 shrink-0'
                onClick={toggleSidebar}
              >
                <PanelLeft className='size-5' />
              </Button>
            )}
            {sidebarOpen && (
              <div className='bg-muted hidden size-9 items-center justify-center rounded-lg sm:flex'>
                <FlaskConicalIcon className='size-4' />
              </div>
            )}
            <div className='min-w-0'>
              <h1 className='truncate text-base leading-tight font-semibold'>
                {t('Model Lab')}
              </h1>
              <p className='text-muted-foreground mt-0.5 truncate text-xs leading-none'>
                {t('Chat with models and compare responses side by side.')}
              </p>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <select
              className='border-input bg-background h-8 max-w-44 rounded-md border px-2 text-sm md:hidden'
              value={activeSessionId}
              onChange={(event) => switchSession(event.target.value)}
            >
              {sessions
                .filter(
                  (s) =>
                    s.messages.length > 0 ||
                    s.compareRounds.length > 0 ||
                    s.id === activeSessionId
                )
                .map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
            </select>
            <Button
              className='md:hidden'
              size='sm'
              variant='outline'
              onClick={() => createSession(mode)}
            >
              {t('New')}
            </Button>
            <div className='bg-muted text-muted-foreground flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium select-none'>
              {mode === 'compare' ? (
                <>
                  <Columns2 className='size-4' />
                  {t('Compare')}
                </>
              ) : (
                <>
                  <MessagesSquareIcon className='size-4' />
                  {t('Chat')}
                </>
              )}
            </div>
          </div>
        </header>

        {mode === 'compare' ? (
          <ComparePanel
            rounds={compareRounds}
            models={models}
            groups={groups}
            groupValue={config.group}
            onGroupChange={(value) => updateConfig('group', value)}
            compareConfig={compareConfig}
            onCompareConfigChange={updateCompareConfig}
            isComparing={isComparing}
            onSend={sendCompare}
            onStop={stopCompare}
            mode={mode}
            onModeChange={handleModeChange}
          />
        ) : isSessionEmpty ? (
          <div className='flex flex-1 flex-col items-center justify-center p-4 md:p-8 relative min-h-0 overflow-y-auto'>
            {/* Brand Logo & Title */}
            <div className='flex flex-col items-center gap-2 mb-6 text-center select-none'>
              <div className='bg-muted flex size-12 items-center justify-center rounded-2xl'>
                <FlaskConicalIcon className='size-6 text-foreground' />
              </div>
              <h2 className='text-2xl font-bold tracking-tight mt-2'>{t('Model Lab')}</h2>
              <p className='text-muted-foreground text-sm max-w-sm'>
                {t('Chat with models and compare responses side by side.')}
              </p>
            </div>

            {/* Chat/Compare Toggle */}
            <div className='mb-6'>
              <Tabs value={mode} onValueChange={handleModeChange}>
                <TabsList className='grid grid-cols-2 w-60 h-9 p-1 bg-muted rounded-lg'>
                  <TabsTrigger value='chat' className='w-full text-xs font-medium'>
                    <MessagesSquareIcon className='size-3.5 mr-1.5' />
                    {t('Chat')}
                  </TabsTrigger>
                  <TabsTrigger value='compare' className='w-full text-xs font-medium'>
                    <Columns2 className='size-3.5 mr-1.5' />
                    {t('Compare')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Input Bar (Centered) */}
            <div className='w-full max-w-4xl shrink-0'>
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
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
