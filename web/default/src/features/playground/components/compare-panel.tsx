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
import { useMemo, useRef, useState, useEffect } from 'react'
import {
  Loader2Icon,
  SquareIcon,
  PlusIcon,
  PaperclipIcon,
  FileIcon,
  SendIcon,
  CpuIcon,
  MailIcon,
  FileTextIcon,
  LanguagesIcon,
  FlaskConicalIcon,
  MessagesSquareIcon,
  Columns2,
  Check,
  Copy,
  Edit,
  Maximize2Icon,
  Minimize2Icon,
  RefreshCw,
  ScaleIcon,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'
import { Response } from '@/components/ai-elements/response'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { GroupSelector } from '@/components/model-group-selector'
import { MESSAGE_ACTION_LABELS } from '../constants'
import { parseThinkTags } from '../lib/message-utils'
import {
  getWebSearchSupport,
  type WebSearchSupport,
} from '../lib/web-search-support'
import type {
  CompareConfig,
  CompareEvaluation,
  CompareRound,
  CompareResult,
  GroupOption,
  ModelOption,
  PlaygroundMode,
} from '../types'
import { MessageActionButton } from './message-action-button'
import { ResponseMetrics } from './response-metrics'
import { UploadedFilesPreview } from './uploaded-files-preview'
import { WebSearchChip, WebSearchMenuItem } from './web-search-controls'

const suggestions = [
  {
    icon: MailIcon,
    text: 'Draft an email',
    color: '#b388ff',
    prompt:
      'Draft a professional email regarding [Insert topic, e.g. project update, meeting request] to [Insert recipient, e.g. client, team]. The tone should be [Insert tone, e.g. polite, formal] and include the following key details:\n- ',
  },
  {
    icon: FileTextIcon,
    text: 'Summarize text',
    color: '#ffd54f',
    prompt:
      'Provide a concise bullet-point summary of the main points and key takeaways from the following text:\n\n[Insert text here]',
  },
  {
    icon: LanguagesIcon,
    text: 'Translate language',
    color: '#81c784',
    prompt:
      'Translate the following text into [Insert target language, e.g. Spanish, Chinese, French, Japanese]. Ensure the translation preserves the original tone, idioms, and context:\n\n"[Insert text here]"',
  },
]

interface ComparePanelProps {
  rounds: CompareRound[]
  models: ModelOption[]
  groups: GroupOption[]
  groupValue: string
  onGroupChange: (value: string) => void
  compareConfig: CompareConfig
  onCompareConfigChange: <K extends keyof CompareConfig>(
    key: K,
    value: CompareConfig[K]
  ) => void
  onRoundsChange: (
    updater: CompareRound[] | ((prev: CompareRound[]) => CompareRound[])
  ) => void
  isComparing: boolean
  onSend: (prompt: string, selectedModels: ModelOption[], files?: any[]) => void
  onStop: () => void
  mode?: PlaygroundMode
  onModeChange?: (mode: PlaygroundMode) => void
  webSearchEnabled?: boolean
  onWebSearchToggle?: () => void
  evaluationEnabled?: boolean
  canEvaluate?: boolean
  isEvaluating?: boolean
  onEvaluate?: () => void
  onStopEvaluation?: () => void
}

export function ComparePanel({
  rounds,
  models,
  groups,
  groupValue,
  onGroupChange,
  compareConfig,
  onCompareConfigChange,
  onRoundsChange,
  isComparing,
  onSend,
  onStop,
  mode,
  onModeChange,
  webSearchEnabled = false,
  onWebSearchToggle,
  evaluationEnabled = false,
  canEvaluate = false,
  isEvaluating = false,
  onEvaluate,
  onStopEvaluation,
}: ComparePanelProps) {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState('')
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [expandedResultKey, setExpandedResultKey] = useState<string | null>(
    null
  )
  const [editingResultKey, setEditingResultKey] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldStickToBottomRef = useRef(true)

  const selectedModels = useMemo(
    () =>
      compareConfig.selectedModelIds
        .map((id) => models.find((model) => model.value === id))
        .filter(Boolean) as ModelOption[],
    [compareConfig.selectedModelIds, models]
  )
  const groupedModels = useMemo(() => {
    const otherCategory = t('Other')
    const grouped = [...models]
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
      )
      .reduce(
        (acc, model) => {
          const category = model.category || otherCategory
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(model)
          return acc
        },
        {} as Record<string, ModelOption[]>
      )

    return Object.entries(grouped).sort(([categoryA], [categoryB]) => {
      if (categoryA === otherCategory) return 1
      if (categoryB === otherCategory) return -1
      return categoryA.localeCompare(categoryB, undefined, {
        sensitivity: 'base',
      })
    })
  }, [models, t])

  useEffect(() => {
    if (expandedResultKey) return
    if (!shouldStickToBottomRef.current) return
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    scrollArea.scrollTop = scrollArea.scrollHeight
  }, [rounds, expandedResultKey])

  const toggleModel = (modelId: string) => {
    const selected = compareConfig.selectedModelIds.includes(modelId)
    if (selected) {
      onCompareConfigChange(
        'selectedModelIds',
        compareConfig.selectedModelIds.filter((id) => id !== modelId)
      )
      return
    }
    if (compareConfig.selectedModelIds.length >= 3) return
    onCompareConfigChange('selectedModelIds', [
      ...compareConfig.selectedModelIds,
      modelId,
    ])
  }

  const submit = (message: PromptInputMessage) => {
    const text = message.text?.trim()
    const hasAttachments = message.files && message.files.length > 0
    if (
      (!text && !hasAttachments) ||
      selectedModels.length !== 3 ||
      isComparing
    )
      return
    shouldStickToBottomRef.current = true
    onSend(text || '', selectedModels, message.files)
    setPrompt('')
  }

  const handleSuggestionClick = (prompt: string) => {
    if (selectedModels.length !== 3 || isComparing) return
    setPrompt(t(prompt))
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[name="message"]'
      ) as HTMLTextAreaElement | null
      if (textarea) {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length
      }
    }, 0)
  }

  const getRoundModels = (round: CompareRound) =>
    round.results
      .map((result) => {
        const model = models.find((item) => item.value === result.modelId)
        return (
          model ?? {
            label: result.modelName,
            value: result.modelId,
          }
        )
      })
      .slice(0, 3)

  const updateCompareResult = (
    roundId: string,
    resultIndex: number,
    updater: (result: CompareResult) => CompareResult
  ) => {
    onRoundsChange((prev) =>
      prev.map((round) =>
        round.id !== roundId
          ? round
          : {
              ...round,
              results: round.results.map((result, index) =>
                index === resultIndex ? updater(result) : result
              ),
            }
      )
    )
  }

  const deleteCompareResult = (roundId: string, resultIndex: number) => {
    onRoundsChange((prev) =>
      prev
        .map((round) =>
          round.id !== roundId
            ? round
            : {
                ...round,
                results: round.results.filter(
                  (_, index) => index !== resultIndex
                ),
              }
        )
        .filter((round) => round.results.length > 0)
    )
    setExpandedResultKey(null)
    setEditingResultKey(null)
  }

  const saveCompareResultEdit = (roundId: string, resultIndex: number) => {
    const nextContent = editText.trim()
    if (!nextContent) return

    updateCompareResult(roundId, resultIndex, (result) => ({
      ...result,
      content: nextContent,
      reasoning: undefined,
    }))
    setEditingResultKey(null)
  }

  const regenerateCompareRound = (round: CompareRound) => {
    const roundModels = getRoundModels(round)
    if (roundModels.length !== 3 || isComparing) return
    onSend(round.prompt, roundModels, round.files)
    setExpandedResultKey(null)
    setEditingResultKey(null)
  }

  const renderModelSelectorContent = () => (
    <div className='max-h-[56vh] overflow-y-auto pr-1'>
      <div className='space-y-4'>
        {groupedModels.map(([category, categoryModels]) => (
          <section key={category} className='space-y-2'>
            <div className='text-muted-foreground flex items-center gap-1.5 px-1 text-xs font-medium'>
              {categoryModels[0]?.categoryIcon && (
                <span className='shrink-0'>
                  {getLobeIcon(categoryModels[0].categoryIcon, 14)}
                </span>
              )}
              <span>{category}</span>
            </div>
            <div className='grid gap-2 sm:grid-cols-2'>
              {categoryModels.map((model) => {
                const selectedIndex = compareConfig.selectedModelIds.indexOf(
                  model.value
                )
                const selected = selectedIndex >= 0
                const atMax =
                  !selected && compareConfig.selectedModelIds.length >= 3
                return (
                  <button
                    key={model.value}
                    type='button'
                    disabled={atMax}
                    onClick={() => toggleModel(model.value)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-3 text-left transition',
                      selected
                        ? 'border-primary bg-primary/5'
                        : atMax
                          ? 'cursor-not-allowed opacity-40'
                          : 'hover:bg-muted/60'
                    )}
                  >
                    <span className='min-w-0'>
                      <span className='block truncate text-sm font-medium'>
                        {model.label}
                      </span>
                      <span className='text-muted-foreground block truncate text-xs'>
                        {model.value}
                      </span>
                    </span>
                    {selected && (
                      <span className='bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
                        {selectedIndex + 1}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )

  const renderInputBar = () => {
    return (
      <div className='grid shrink-0 gap-4 px-1 md:pb-4'>
        <PromptInput
          groupClassName='rounded-xl'
          onSubmit={submit}
          accept='image/*,application/pdf,text/*,application/json'
          maxFiles={5}
          maxFileSize={20 * 1024 * 1024}
          onError={(err) => toast.error(err.message)}
        >
          <CompareInputInner
            prompt={prompt}
            setPrompt={setPrompt}
            isComparing={isComparing}
            selectedModels={selectedModels}
            onStop={onStop}
            groups={groups}
            groupValue={groupValue}
            onGroupChange={onGroupChange}
            setSelectorOpen={setSelectorOpen}
            initialView={rounds.length === 0}
            webSearchEnabled={webSearchEnabled}
            onWebSearchToggle={onWebSearchToggle}
            evaluationEnabled={evaluationEnabled}
            canEvaluate={canEvaluate}
            isEvaluating={isEvaluating}
            onEvaluate={onEvaluate}
            onStopEvaluation={onStopEvaluation}
          />
        </PromptInput>
        <Suggestions>
          {suggestions.map(({ icon: Icon, text, color, prompt: sugPrompt }) => (
            <Suggestion
              className={`text-xs font-normal sm:text-sm ${
                text === 'More' ? 'hidden sm:flex' : ''
              }`}
              key={text}
              onClick={() => handleSuggestionClick(sugPrompt)}
              suggestion={text}
            >
              {Icon && <Icon size={16} style={{ color }} />}
              {t(text)}
            </Suggestion>
          ))}
        </Suggestions>
      </div>
    )
  }

  if (rounds.length === 0) {
    return (
      <div className='relative flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-y-auto p-4 md:p-8'>
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
        {mode && onModeChange && (
          <div className='mb-6'>
            <Tabs value={mode} onValueChange={onModeChange}>
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
        )}

        {/* Input Bar (Centered) */}
        <div className='w-full max-w-4xl shrink-0'>{renderInputBar()}</div>

        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogContent className='sm:max-w-4xl'>
            <DialogHeader>
              <DialogTitle>{t('Select models')}</DialogTitle>
              <DialogDescription>
                {t('Choose exactly 3 models for comparison.')}
              </DialogDescription>
            </DialogHeader>
            {renderModelSelectorContent()}
            <DialogFooter>
              <Button
                disabled={compareConfig.selectedModelIds.length !== 3}
                onClick={() => setSelectorOpen(false)}
              >
                {t('Confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
      <div
        ref={scrollAreaRef}
        className='relative min-h-0 flex-1 overflow-y-auto px-4 py-4'
        onScroll={(event) => {
          const target = event.currentTarget
          const distanceFromBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight
          shouldStickToBottomRef.current = distanceFromBottom < 80
        }}
      >
        <div className='mx-auto w-full max-w-4xl space-y-5'>
          {rounds.map((round) => (
            <section key={round.id} className='space-y-3'>
              <div className='flex flex-col items-end gap-1.5'>
                {round.prompt && (
                  <div className='bg-primary text-primary-foreground max-w-[88%] rounded-lg px-4 py-2 text-sm'>
                    {round.prompt}
                  </div>
                )}
                {round.files && round.files.length > 0 && (
                  <div className='flex max-w-[88%] flex-wrap justify-end gap-2'>
                    {round.files.map((file, idx) => {
                      const isImage = file.mediaType?.startsWith('image/')
                      return (
                        <div
                          key={idx}
                          className='bg-muted/40 flex max-w-xs items-center gap-2 rounded-lg border p-2 text-sm'
                        >
                          {isImage ? (
                            <img
                              src={file.url}
                              alt={file.filename || 'uploaded image'}
                              className='size-8 rounded object-cover'
                            />
                          ) : (
                            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded'>
                              <FileIcon size={16} />
                            </div>
                          )}
                          <div className='flex min-w-0 flex-col pr-1 text-left'>
                            <span className='text-foreground truncate text-[10px] font-medium'>
                              {file.filename ||
                                (isImage ? 'Image' : 'Attachment')}
                            </span>
                            {file.mediaType && (
                              <span className='text-muted-foreground truncate font-mono text-[8px]'>
                                {file.mediaType}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <CompareRoundResults
                round={round}
                expandedResultKey={expandedResultKey}
                editingResultKey={editingResultKey}
                editText={editText}
                isComparing={isComparing}
                onEditTextChange={setEditText}
                onToggleExpanded={(resultKey) => {
                  setExpandedResultKey((current) =>
                    current === resultKey ? null : resultKey
                  )
                  setEditingResultKey(null)
                }}
                onStartEdit={(resultKey, content) => {
                  setExpandedResultKey(resultKey)
                  setEditingResultKey(resultKey)
                  setEditText(content)
                }}
                onCancelEdit={() => setEditingResultKey(null)}
                onSaveEdit={(resultIndex) =>
                  saveCompareResultEdit(round.id, resultIndex)
                }
                onDelete={(resultIndex) =>
                  deleteCompareResult(round.id, resultIndex)
                }
                onRegenerate={() => regenerateCompareRound(round)}
                onCollapse={() => {
                  setExpandedResultKey(null)
                  setEditingResultKey(null)
                }}
              />
              {round.evaluation && (
                <>
                  <div className='flex flex-col items-end gap-1.5'>
                    <div className='bg-primary text-primary-foreground flex max-w-[88%] items-center gap-1.5 rounded-lg px-4 py-2 text-sm'>
                      <ScaleIcon className='size-3.5' />
                      {t('Evaluation')}
                    </div>
                  </div>
                  <CompareEvaluationCard evaluation={round.evaluation} />
                </>
              )}
            </section>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className='mx-auto w-full max-w-4xl'>{renderInputBar()}</div>

      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className='sm:max-w-4xl'>
          <DialogHeader>
            <DialogTitle>{t('Select models')}</DialogTitle>
            <DialogDescription>
              {t('Choose exactly 3 models for comparison.')}
            </DialogDescription>
          </DialogHeader>
          {renderModelSelectorContent()}
          <DialogFooter>
            <Button
              disabled={compareConfig.selectedModelIds.length !== 3}
              onClick={() => setSelectorOpen(false)}
            >
              {t('Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CompareRoundResults({
  round,
  expandedResultKey,
  editingResultKey,
  editText,
  isComparing,
  onEditTextChange,
  onToggleExpanded,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRegenerate,
  onCollapse,
}: {
  round: CompareRound
  expandedResultKey: string | null
  editingResultKey: string | null
  editText: string
  isComparing: boolean
  onEditTextChange: (value: string) => void
  onToggleExpanded: (resultKey: string) => void
  onStartEdit: (resultKey: string, content: string) => void
  onCancelEdit: () => void
  onSaveEdit: (resultIndex: number) => void
  onDelete: (resultIndex: number) => void
  onRegenerate: () => void
  onCollapse: () => void
}) {
  const { t } = useTranslation()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const isAnyExpanded = expandedResultKey?.startsWith(`${round.id}:`) ?? false

  // Track which card is centered in the mobile carousel for the dot indicator.
  const handleScroll = () => {
    const el = scrollerRef.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    Array.from(el.children).forEach((child, index) => {
      const node = child as HTMLElement
      const nodeCenter = node.offsetLeft + node.offsetWidth / 2
      const dist = Math.abs(nodeCenter - center)
      if (dist < bestDist) {
        bestDist = dist
        best = index
      }
    })
    setActiveIndex((prev) => (prev === best ? prev : best))
  }

  return (
    <div className='relative'>
      {isAnyExpanded && (
        <button
          type='button'
          aria-label={t('Collapse')}
          className='fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-sm lg:absolute lg:z-20 lg:bg-transparent lg:backdrop-blur-none'
          onClick={onCollapse}
        />
      )}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className='-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:min-h-[min(34rem,65vh)] lg:snap-none lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden'
      >
        {round.results.map((result, resultIndex) => {
          const resultKey = `${round.id}:${resultIndex}`
          const isExpanded = expandedResultKey === resultKey

          return (
            <CompareResultCard
              key={resultKey}
              result={result}
              round={round}
              resultIndex={resultIndex}
              resultKey={resultKey}
              isExpanded={isExpanded}
              isEditing={editingResultKey === resultKey}
              editText={editText}
              isComparing={isComparing}
              onEditTextChange={onEditTextChange}
              onToggleExpanded={() => onToggleExpanded(resultKey)}
              onStartEdit={(content) => onStartEdit(resultKey, content)}
              onCancelEdit={onCancelEdit}
              onSaveEdit={() => onSaveEdit(resultIndex)}
              onDelete={() => onDelete(resultIndex)}
              onRegenerate={onRegenerate}
            />
          )
        })}
      </div>
      {round.results.length > 1 && (
        <div className='mt-2.5 flex justify-center gap-1.5 lg:hidden'>
          {round.results.map((_, index) => (
            <span
              key={`${round.id}:dot:${index}`}
              aria-hidden='true'
              className={cn(
                'size-1.5 rounded-full transition-colors duration-200',
                index === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CompareResultCard({
  result,
  round,
  resultIndex,
  resultKey,
  isExpanded,
  isEditing,
  editText,
  isComparing,
  onEditTextChange,
  onToggleExpanded,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRegenerate,
}: {
  result: CompareResult
  round: CompareRound
  resultIndex: number
  resultKey: string
  isExpanded: boolean
  isEditing: boolean
  editText: string
  isComparing: boolean
  onEditTextChange: (value: string) => void
  onToggleExpanded: () => void
  onStartEdit: (content: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDelete: () => void
  onRegenerate: () => void
}) {
  const { t } = useTranslation()
  const { copiedText, copyToClipboard } = useCopyToClipboard()
  const parsed = parseThinkTags(result.content)
  const reasoning = result.reasoning || parsed.reasoning
  const visibleContent = parsed.visibleContent || result.content
  const ExpandIcon = isExpanded ? Minimize2Icon : Maximize2Icon
  const copyContent = visibleContent || result.content
  const isCopied = copiedText === copyContent
  const canSaveEdit = editText.trim().length > 0 && editText !== result.content
  const contentRef = useRef<HTMLDivElement>(null)
  const expandedOriginClass =
    resultIndex === 0
      ? 'origin-left'
      : resultIndex === 2
        ? 'origin-right'
        : 'origin-center'

  useEffect(() => {
    if (result.status !== 'loading' && result.status !== 'streaming') return
    const content = contentRef.current
    if (!content) return

    content.scrollTop = content.scrollHeight
  }, [visibleContent, reasoning, result.status])

  return (
    <div className='h-[min(34rem,65vh)] min-h-64 shrink-0 basis-[88%] snap-center sm:basis-[48%] lg:w-full lg:max-w-[32rem] lg:shrink lg:basis-auto lg:justify-self-center'>
      <article
        id={`compare-expanded-${resultKey}`}
        className={cn(
          'bg-card group/compare-result flex cursor-default flex-col overflow-hidden rounded-lg border shadow-xs transition-[background-color,border-color,box-shadow,transform,width,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none',
          'motion-reduce:transform-none motion-reduce:transition-colors',
          isExpanded
            ? cn(
                'border-primary/50 shadow-primary/15 ring-primary/15 shadow-2xl ring-2',
                'fixed inset-2 z-50',
                'lg:absolute lg:inset-auto lg:top-0 lg:left-1/2 lg:z-30 lg:h-[min(34rem,65vh)] lg:w-[min(calc(100%_-_2rem),48rem)] lg:max-w-[48rem] lg:-translate-x-1/2',
                'animate-in zoom-in-95 duration-300',
                expandedOriginClass
              )
            : 'relative h-full w-full hover:border-primary/40 hover:ring-primary/15 hover:shadow-primary/10 hover:-translate-y-1 hover:shadow-lg hover:ring-2'
        )}
      >
        <header
          className={cn(
            'flex justify-between gap-2 border-b p-3',
            isExpanded ? 'items-start' : 'items-center'
          )}
        >
          <div className='min-w-0'>
            <p
              className={cn(
                'truncate font-semibold',
                isExpanded ? 'text-base' : 'text-sm'
              )}
            >
              {result.modelName}
            </p>
            <p className='text-muted-foreground truncate text-xs'>
              {result.modelId}
            </p>
            {isExpanded && (
              <p className='text-muted-foreground mt-1 line-clamp-1 text-xs'>
                {round.prompt}
              </p>
            )}
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            {(result.status === 'loading' || result.status === 'streaming') && (
              <Loader2Icon className='text-muted-foreground size-4 animate-spin' />
            )}
            <Button
              type='button'
              variant='ghost'
              size='icon-xs'
              aria-expanded={isExpanded}
              aria-controls={`compare-expanded-${resultKey}`}
              aria-label={`${t(isExpanded ? 'Collapse' : 'Expand')} ${result.modelName}`}
              onClick={(event) => {
                event.stopPropagation()
                onToggleExpanded()
              }}
              className='text-muted-foreground group-hover/compare-result:text-primary transition-colors duration-200'
            >
              <ExpandIcon aria-hidden='true' />
            </Button>
          </div>
        </header>
        <div
          ref={contentRef}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain',
            isExpanded ? 'p-4' : 'space-y-3 p-3'
          )}
        >
          {isEditing ? (
            <div className='space-y-3'>
              <Textarea
                value={editText}
                onChange={(event) => onEditTextChange(event.target.value)}
                className='min-h-72 font-mono text-sm'
              />
              <div className='flex justify-end gap-2'>
                <Button size='sm' variant='outline' onClick={onCancelEdit}>
                  {t('Cancel')}
                </Button>
                <Button size='sm' onClick={onSaveEdit} disabled={!canSaveEdit}>
                  {t('Save')}
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              {reasoning && (
                <Reasoning
                  defaultOpen={false}
                  isStreaming={result.status === 'streaming'}
                >
                  <ReasoningTrigger />
                  <ReasoningContent>{reasoning}</ReasoningContent>
                </Reasoning>
              )}
              {result.status === 'error' ? (
                <p className='text-destructive text-sm'>
                  {result.errorMessage || t('Request failed')}
                </p>
              ) : visibleContent ? (
                <div className='prose prose-sm dark:prose-invert max-w-none'>
                  <Response>{visibleContent}</Response>
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  {t('Waiting...')}
                </p>
              )}
            </div>
          )}
        </div>
        <footer
          className={cn(
            'flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between',
            !isExpanded && 'lg:block'
          )}
        >
          <ResponseMetrics metrics={result.metrics} />
          <TooltipProvider delay={300}>
            <div
              className={cn(
                'flex shrink-0 items-center justify-end gap-0.5',
                !isExpanded && 'lg:hidden'
              )}
            >
              <MessageActionButton
                icon={isCopied ? Check : Copy}
                label={
                  isCopied
                    ? MESSAGE_ACTION_LABELS.COPIED
                    : MESSAGE_ACTION_LABELS.COPY
                }
                onClick={() => {
                  if (!copyContent) {
                    toast.warning(MESSAGE_ACTION_LABELS.NO_CONTENT)
                    return
                  }
                  copyToClipboard(copyContent)
                }}
                className={isCopied ? 'text-green-600' : ''}
              />
              <MessageActionButton
                icon={RefreshCw}
                label={MESSAGE_ACTION_LABELS.REGENERATE}
                onClick={onRegenerate}
                disabled={isComparing || round.results.length !== 3}
              />
              <MessageActionButton
                icon={Edit}
                label={MESSAGE_ACTION_LABELS.EDIT}
                onClick={() => onStartEdit(result.content)}
                disabled={isComparing}
              />
              <MessageActionButton
                icon={Trash2}
                label={MESSAGE_ACTION_LABELS.DELETE}
                onClick={onDelete}
                disabled={isComparing}
                variant='destructive'
              />
            </div>
          </TooltipProvider>
        </footer>
      </article>
    </div>
  )
}

function CompareEvaluationCard({
  evaluation,
}: {
  evaluation: CompareEvaluation
}) {
  const { t } = useTranslation()
  const parsed = parseThinkTags(evaluation.content)
  const reasoning = evaluation.reasoning || parsed.reasoning
  const visibleContent = parsed.visibleContent || evaluation.content

  return (
    <article className='bg-card flex w-full flex-col overflow-hidden rounded-lg border shadow-xs'>
      <header className='flex items-center justify-between gap-2 border-b p-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <ScaleIcon className='text-muted-foreground size-4 shrink-0' />
          <p className='truncate text-sm font-semibold'>{t('Evaluation')}</p>
        </div>
        {(evaluation.status === 'loading' ||
          evaluation.status === 'streaming') && (
          <Loader2Icon className='text-muted-foreground size-4 shrink-0 animate-spin' />
        )}
      </header>
      <div className='space-y-3 p-3'>
        {reasoning && (
          <Reasoning
            defaultOpen={false}
            isStreaming={evaluation.status === 'streaming'}
          >
            <ReasoningTrigger />
            <ReasoningContent>{reasoning}</ReasoningContent>
          </Reasoning>
        )}
        {evaluation.status === 'error' ? (
          <p className='text-destructive text-sm'>
            {evaluation.errorMessage || t('Request failed')}
          </p>
        ) : visibleContent ? (
          <div className='prose prose-sm dark:prose-invert max-w-none'>
            <Response>{visibleContent}</Response>
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>{t('Waiting...')}</p>
        )}
      </div>
      <footer className='border-t p-3'>
        <ResponseMetrics metrics={evaluation.metrics} />
      </footer>
    </article>
  )
}

function CompareSubmitButton({
  disabled,
  text,
  isComparing,
  onStop,
}: {
  disabled?: boolean
  text: string
  isComparing?: boolean
  onStop?: () => void
}) {
  const { t } = useTranslation()
  const attachments = usePromptInputAttachments()
  const hasContent = text.trim().length > 0 || attachments.files.length > 0

  if (isComparing && onStop) {
    return (
      <PromptInputButton
        aria-label={t('Stop')}
        className='text-foreground size-10 sm:size-8'
        onClick={onStop}
        variant='secondary'
      >
        <SquareIcon className='fill-current' size={16} />
      </PromptInputButton>
    )
  }

  return (
    <PromptInputButton
      aria-label={t('Send')}
      className='text-foreground size-10 sm:size-8'
      disabled={disabled || !hasContent}
      type='submit'
      variant='secondary'
    >
      <SendIcon size={16} />
    </PromptInputButton>
  )
}

interface CompareInputInnerProps {
  prompt: string
  setPrompt: (v: string) => void
  isComparing: boolean
  selectedModels: ModelOption[]
  onStop: () => void
  groups: GroupOption[]
  groupValue: string
  onGroupChange: (value: string) => void
  setSelectorOpen: (open: boolean) => void
  initialView?: boolean
  webSearchEnabled?: boolean
  onWebSearchToggle?: () => void
  evaluationEnabled?: boolean
  canEvaluate?: boolean
  isEvaluating?: boolean
  onEvaluate?: () => void
  onStopEvaluation?: () => void
}

function CompareInputInner({
  prompt,
  setPrompt,
  isComparing,
  selectedModels,
  onStop,
  groups,
  groupValue,
  onGroupChange,
  setSelectorOpen,
  initialView = false,
  webSearchEnabled = false,
  onWebSearchToggle,
  evaluationEnabled = false,
  canEvaluate = false,
  isEvaluating = false,
  onEvaluate,
  onStopEvaluation,
}: CompareInputInnerProps) {
  const { t } = useTranslation()
  const attachments = usePromptInputAttachments()
  const inputMenuSide = initialView ? 'bottom' : 'top'

  // Web search applies per compared model; the global toggle is available
  // when at least one selected model supports it via web_search_options.
  const webSearchSupport = useMemo<WebSearchSupport>(() => {
    const supports = selectedModels.map((model) => getWebSearchSupport(model))
    if (supports.includes('supported')) return 'supported'
    if (supports.includes('builtin')) return 'builtin'
    return 'unsupported'
  }, [selectedModels])

  return (
    <>
      <UploadedFilesPreview />

      <PromptInputTextarea
        autoComplete='off'
        autoCorrect='off'
        className='px-5 md:text-base'
        disabled={isComparing}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder={
          selectedModels.length === 3
            ? t('Ask anything')
            : t('Select exactly 3 models to compare')
        }
        spellCheck={false}
        value={prompt}
      />

      <PromptInputFooter className='p-2.5'>
        <PromptInputTools>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <PromptInputButton
                  className='size-10 border font-medium sm:size-8'
                  disabled={isComparing}
                  variant='outline'
                />
              }
            >
              <PlusIcon size={16} />
              <span className='sr-only'>{t('More input options')}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' side={inputMenuSide}>
              <DropdownMenuItem onClick={() => attachments.openFileDialog()}>
                <PaperclipIcon className='mr-2' size={16} />
                {t('Add files & photos')}
              </DropdownMenuItem>
              <WebSearchMenuItem
                support={webSearchSupport}
                enabled={webSearchEnabled}
                onToggle={onWebSearchToggle}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <WebSearchChip
            support={webSearchSupport}
            enabled={webSearchEnabled}
            onToggle={onWebSearchToggle}
            disabled={isComparing}
          />
        </PromptInputTools>

        <div className='flex flex-wrap items-center justify-end gap-2'>
          <GroupSelector
            selectedGroup={groupValue}
            groups={groups}
            onGroupChange={onGroupChange}
            disabled={groups.length === 0 || isComparing}
          />

          <Button
            variant='outline'
            size='sm'
            disabled={isComparing}
            onClick={() => setSelectorOpen(true)}
            className={cn(
              'flex h-10 w-10 items-center justify-center gap-2 border p-0 font-medium sm:h-8 sm:w-auto sm:justify-start sm:px-3',
              'bg-background text-foreground',
              'hover:bg-accent transition-colors',
              'focus:!ring-0 focus:!outline-none',
              'text-sm shadow-none sm:text-xs'
            )}
          >
            <CpuIcon className='text-muted-foreground size-4' />
            <span className='hidden sm:inline-block'>
              {t('Models')} ({selectedModels.length}/3)
            </span>
          </Button>

          {evaluationEnabled && onEvaluate && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isEvaluating ? false : !canEvaluate || isComparing}
              onClick={isEvaluating ? onStopEvaluation : onEvaluate}
              className='flex h-10 items-center gap-2 border px-3 text-sm font-medium shadow-none sm:h-8 sm:text-xs'
              title={t('Evaluate the latest round of responses')}
            >
              {isEvaluating ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <ScaleIcon className='text-muted-foreground size-4' />
              )}
              <span>{isEvaluating ? t('Stop') : t('Evaluate')}</span>
            </Button>
          )}

          <CompareSubmitButton
            disabled={isComparing || selectedModels.length !== 3}
            text={prompt}
            onStop={onStop}
            isComparing={isComparing}
          />
        </div>
      </PromptInputFooter>
    </>
  )
}
