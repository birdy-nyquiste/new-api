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
import { useState, useRef, useMemo } from 'react'
import {
  Edit3Icon,
  PanelLeftClose,
  Trash2Icon,
  FlaskConicalIcon,
  SquarePen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { PlaygroundMode, PlaygroundSession } from '../types'

interface SessionHistoryProps {
  sessions: PlaygroundSession[]
  activeSessionId: string
  onCreateSession: (mode?: PlaygroundMode) => void
  onSwitchSession: (sessionId: string) => void
  onRenameSession: (sessionId: string, title: string) => void
  onDeleteSession: (sessionId: string) => void
  onClearSessions: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function SessionHistory({
  sessions,
  activeSessionId,
  onCreateSession,
  onSwitchSession,
  onRenameSession,
  onDeleteSession,
  onClearSessions,
  sidebarOpen,
  onToggleSidebar,
}: SessionHistoryProps) {
  const { t } = useTranslation()

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const preventSaveRef = useRef(false)

  const startRename = (session: PlaygroundSession) => {
    preventSaveRef.current = false
    setEditingSessionId(session.id)
    setEditTitle(session.title || '')
  }

  const handleBlur = (sessionId: string) => {
    if (preventSaveRef.current) return
    const trimmed = editTitle.trim()
    if (trimmed) {
      onRenameSession(sessionId, trimmed)
    }
    setEditingSessionId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      preventSaveRef.current = true
      setEditingSessionId(null)
    }
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] =
    useState<PlaygroundSession | null>(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  const remove = (session: PlaygroundSession) => {
    setSessionToDelete(session)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.id)
      setSessionToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  const clear = () => {
    setClearConfirmOpen(true)
  }

  const confirmClear = () => {
    onClearSessions()
    setClearConfirmOpen(false)
  }

  const visibleSessions = useMemo(() => {
    return sessions.filter(
      (s) => s.messages.length > 0 || s.compareRounds.length > 0
    )
  }, [sessions])

  return (
    <aside
      className={cn(
        // Off-canvas overlay drawer on phones; in-flow push sidebar at md+.
        'bg-background absolute inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r transition-all duration-200 ease-in-out md:relative md:z-auto md:translate-x-0',
        sidebarOpen
          ? 'translate-x-0 md:w-64'
          : '-translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden md:border-r-0'
      )}
    >
      <div className='flex h-full w-64 shrink-0 flex-col'>
        <div className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4'>
          <div className='flex items-center gap-2 min-w-0'>
            <div className='bg-muted flex size-8 items-center justify-center rounded-lg shrink-0'>
              <FlaskConicalIcon className='size-4' />
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-semibold leading-tight truncate'>{t('Model Lab')}</p>
            </div>
          </div>
          <Button
            aria-label={t('Collapse sidebar')}
            size='icon'
            variant='ghost'
            className='size-8 shrink-0'
            onClick={onToggleSidebar}
          >
            <PanelLeftClose className='size-4' />
          </Button>
        </div>

        <div className='min-h-0 flex-1 flex flex-col p-2 space-y-1'>
          {/* New Session Row */}
          <button
            onClick={() => onCreateSession()}
            className='w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-muted/60 rounded-lg text-left text-foreground transition-colors'
          >
            <SquarePen className='size-4 text-muted-foreground' />
            <span>{t('New session')}</span>
          </button>

          {/* History Section Header */}
          <div className='px-3 pt-4 pb-1.5 select-none'>
            <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('History')}
            </p>
          </div>

          {/* Scrollable list of history */}
          <ScrollArea className='min-h-0 flex-1'>
            <div className='space-y-0.5'>
              {visibleSessions.map((session) => {
                const active = session.id === activeSessionId
                const isEditing = session.id === editingSessionId
                return (
                  <div
                    key={session.id}
                    className={cn(
                      'group flex items-center gap-1 rounded-lg p-1 transition-colors',
                      active
                        ? 'bg-muted text-foreground'
                        : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {isEditing ? (
                      <div className='flex w-full items-center px-1 py-0.5'>
                        <input
                          type='text'
                          className='border-input bg-background focus-visible:ring-ring h-8 w-full rounded-md border px-2 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none'
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleBlur(session.id)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <button
                          type='button'
                          className='min-w-0 flex-1 rounded px-2 py-1.5 text-left'
                          onClick={() => onSwitchSession(session.id)}
                          onDoubleClick={() => startRename(session)}
                        >
                          <p className='truncate text-sm font-medium'>
                            {session.title || t('New session')}
                          </p>
                        </button>
                        <Button
                          aria-label={t('Rename')}
                          className='opacity-0 group-hover:opacity-100 size-7 shrink-0'
                          size='icon'
                          variant='ghost'
                          onClick={() => startRename(session)}
                        >
                          <Edit3Icon className='size-3.5' />
                        </Button>
                        <Button
                          aria-label={t('Delete')}
                          className='text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 size-7 shrink-0'
                          size='icon'
                          variant='ghost'
                          onClick={() => remove(session)}
                        >
                          <Trash2Icon className='size-3.5' />
                        </Button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className='border-t p-2 shrink-0'>
          <Button className='w-full' size='sm' variant='ghost' onClick={clear}>
            {t('Clear local history')}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('Delete Session')}
        desc={t(
          'Are you sure you want to delete this session? This action cannot be undone.'
        )}
        destructive
        confirmText={t('Delete')}
        handleConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title={t('Clear Local History')}
        desc={t(
          'Are you sure you want to clear all local Model Lab sessions? This action cannot be undone.'
        )}
        destructive
        confirmText={t('Clear All')}
        handleConfirm={confirmClear}
      />
    </aside>
  )
}
