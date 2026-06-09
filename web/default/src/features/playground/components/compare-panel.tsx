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
  GlobeIcon,
  SendIcon,
  CpuIcon,
  MailIcon,
  FileTextIcon,
  LanguagesIcon,
  FlaskConicalIcon,
  MessagesSquareIcon,
  Columns2,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getLobeIcon } from '@/lib/lobe-icon'
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
import { Switch } from '@/components/ui/switch'
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
import { parseThinkTags } from '../lib/message-utils'
import type {
  CompareConfig,
  CompareRound,
  CompareResult,
  GroupOption,
  ModelOption,
  PlaygroundMode,
} from '../types'
import { ResponseMetrics } from './response-metrics'
import { UploadedFilesPreview } from './uploaded-files-preview'

const suggestions = [
  {
    icon: MailIcon,
    text: 'Draft an email',
    color: '#b388ff',
    prompt: 'Draft a professional email regarding [Insert topic, e.g. project update, meeting request] to [Insert recipient, e.g. client, team]. The tone should be [Insert tone, e.g. polite, formal] and include the following key details:\n- ',
  },
  {
    icon: FileTextIcon,
    text: 'Summarize text',
    color: '#ffd54f',
    prompt: 'Provide a concise bullet-point summary of the main points and key takeaways from the following text:\n\n[Insert text here]',
  },
  {
    icon: LanguagesIcon,
    text: 'Translate language',
    color: '#81c784',
    prompt: 'Translate the following text into [Insert target language, e.g. Spanish, Chinese, French, Japanese]. Ensure the translation preserves the original tone, idioms, and context:\n\n"[Insert text here]"',
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
  isComparing: boolean
  onSend: (prompt: string, selectedModels: ModelOption[], files?: any[]) => void
  onStop: () => void
  mode?: PlaygroundMode
  onModeChange?: (mode: PlaygroundMode) => void
}

export function ComparePanel({
  rounds,
  models,
  groups,
  groupValue,
  onGroupChange,
  compareConfig,
  onCompareConfigChange,
  isComparing,
  onSend,
  onStop,
  mode,
  onModeChange,
}: ComparePanelProps) {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState('')
  const [selectorOpen, setSelectorOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rounds])

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
    if ((!text && !hasAttachments) || selectedModels.length !== 3 || isComparing) return
    onSend(text || '', selectedModels, message.files)
    setPrompt('')
  }

  const handleSuggestionClick = (prompt: string) => {
    if (selectedModels.length !== 3 || isComparing) return
    setPrompt(t(prompt))
    setTimeout(() => {
      const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement | null
      if (textarea) {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length
      }
    }, 0)
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
            compareConfig={compareConfig}
            onCompareConfigChange={onCompareConfigChange}
            initialView={rounds.length === 0}
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
      <div className='flex flex-1 flex-col items-center justify-center p-4 md:p-8 relative min-h-0 overflow-y-auto w-full'>
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
        {mode && onModeChange && (
          <div className='mb-6'>
            <Tabs value={mode} onValueChange={onModeChange}>
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
        )}

        {/* Input Bar (Centered) */}
        <div className='w-full max-w-4xl shrink-0'>
          {renderInputBar()}
        </div>

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
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4'>
        <div className='mx-auto max-w-6xl space-y-5'>
          {rounds.map((round) => (
            <section key={round.id} className='space-y-3'>
              <div className='flex flex-col items-end gap-1.5'>
                {round.prompt && (
                  <div className='bg-primary text-primary-foreground max-w-[88%] rounded-lg px-4 py-2 text-sm'>
                    {round.prompt}
                  </div>
                )}
                {round.files && round.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end max-w-[88%]">
                    {round.files.map((file, idx) => {
                      const isImage = file.mediaType?.startsWith('image/')
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2 text-sm max-w-xs"
                        >
                          {isImage ? (
                            <img
                              src={file.url}
                              alt={file.filename || 'uploaded image'}
                              className="size-8 rounded object-cover"
                            />
                          ) : (
                            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                              <FileIcon size={16} />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0 pr-1 text-left">
                            <span className="truncate font-medium text-[10px] text-foreground">
                              {file.filename || (isImage ? 'Image' : 'Attachment')}
                            </span>
                            {file.mediaType && (
                              <span className="text-[8px] text-muted-foreground truncate font-mono">
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
              <div className='grid gap-3 lg:grid-cols-3'>
                {round.results.map((result) => (
                  <CompareResultCard key={result.id} result={result} />
                ))}
              </div>
            </section>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className='mx-auto w-full max-w-4xl shrink-0'>
        {renderInputBar()}
      </div>

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

function CompareResultCard({ result }: { result: CompareResult }) {
  const { t } = useTranslation()
  const parsed = parseThinkTags(result.content)
  const reasoning = result.reasoning || parsed.reasoning
  const visibleContent = parsed.visibleContent || result.content

  return (
    <article className='bg-card flex min-h-64 max-h-[min(34rem,65vh)] flex-col overflow-hidden rounded-lg border'>
      <header className='flex items-center justify-between gap-2 border-b p-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>{result.modelName}</p>
          <p className='text-muted-foreground truncate text-xs'>
            {result.modelId}
          </p>
        </div>
        {(result.status === 'loading' || result.status === 'streaming') && (
          <Loader2Icon className='text-muted-foreground size-4 animate-spin' />
        )}
      </header>
      <div className='min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3'>
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
          <p className='text-muted-foreground text-sm'>{t('Waiting...')}</p>
        )}
      </div>
      <div className='border-t p-3'>
        <ResponseMetrics metrics={result.metrics} />
      </div>
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
        className='text-foreground font-medium'
        onClick={onStop}
        variant='secondary'
      >
        <SquareIcon className='fill-current' size={16} />
        <span className='hidden sm:inline'>{t('Stop')}</span>
        <span className='sr-only sm:hidden'>{t('Stop')}</span>
      </PromptInputButton>
    )
  }

  return (
    <Button
      type='submit'
      className='text-foreground border bg-secondary font-medium hover:bg-secondary/85 shadow-none'
      disabled={disabled || !hasContent}
    >
      <SendIcon size={16} />
      <span className='hidden sm:inline'>{t('Compare')}</span>
      <span className='sr-only sm:hidden'>{t('Compare')}</span>
    </Button>
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
  compareConfig: CompareConfig
  onCompareConfigChange: <K extends keyof CompareConfig>(
    key: K,
    value: CompareConfig[K]
  ) => void
  initialView?: boolean
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
  compareConfig,
  onCompareConfigChange,
  initialView = false,
}: CompareInputInnerProps) {
  const { t } = useTranslation()
  const attachments = usePromptInputAttachments()
  const inputMenuSide = initialView ? 'bottom' : 'top'

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
                  className='border font-medium'
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
              <DropdownMenuItem
                onClick={() => toast.info(t('Search feature in development'))}
              >
                <GlobeIcon className='mr-2' size={16} />
                {t('Web search')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PromptInputTools>

        <div className='flex items-center gap-1.5 md:gap-2'>
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
              'flex h-8 items-center gap-2 border px-3 font-medium',
              'justify-center p-0 sm:w-auto sm:justify-start sm:px-3',
              'w-8 sm:w-auto',
              'bg-background text-foreground',
              'hover:bg-accent transition-colors',
              'focus:!ring-0 focus:!outline-none',
              'text-xs shadow-none'
            )}
          >
            <CpuIcon className='text-muted-foreground size-4' />
            <span className='hidden sm:inline-block'>
              {t('Models')} ({selectedModels.length}/3)
            </span>
            <span className='inline-block text-xs sm:hidden'>
              {selectedModels.length}
            </span>
          </Button>

          <label className='bg-background hover:bg-accent flex h-8 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-xs transition-colors select-none'>
            <Switch
              checked={compareConfig.includeContext}
              onCheckedChange={(checked) =>
                onCompareConfigChange('includeContext', checked)
              }
              size='sm'
              className='origin-left scale-90'
            />
            <span className='hidden sm:inline'>{t('Use context')}</span>
            <span className='sr-only sm:hidden'>{t('Context')}</span>
          </label>

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
