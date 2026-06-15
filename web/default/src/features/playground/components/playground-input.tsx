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
import { useCallback, useRef, useState, type RefObject } from 'react'
import {
  PlusIcon,
  PaperclipIcon,
  SendIcon,
  SquareIcon,
  MailIcon,
  FileTextIcon,
  LanguagesIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { ModelGroupSelector } from '@/components/model-group-selector'
import type { WebSearchSupport } from '../lib/web-search-support'
import type { ModelOption, GroupOption } from '../types'
import { UploadedFilesPreview } from './uploaded-files-preview'
import { WebSearchChip, WebSearchMenuItem } from './web-search-controls'

interface PlaygroundInputProps {
  onSubmit: (message: PromptInputMessage) => void
  onStop?: () => void
  disabled?: boolean
  isGenerating?: boolean
  initialView?: boolean
  models: ModelOption[]
  modelValue: string
  onModelChange: (value: string) => void
  isModelLoading?: boolean
  groups: GroupOption[]
  groupValue: string
  onGroupChange: (value: string) => void
  webSearchEnabled?: boolean
  webSearchSupport?: WebSearchSupport
  onWebSearchToggle?: () => void
}

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

export function PlaygroundInput(props: PlaygroundInputProps) {
  const { t } = useTranslation()
  const [hasText, setHasText] = useState(false)
  const hasTextRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim() && (!message.files || message.files.length === 0))
      return
    if (props.disabled) return
    props.onSubmit(message)
    hasTextRef.current = false
    setHasText(false)
  }

  const updateHasText = useCallback((next: boolean) => {
    if (hasTextRef.current === next) return
    hasTextRef.current = next
    setHasText(next)
  }, [])

  const handleSuggestionClick = (prompt: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.value = t(prompt)
    updateHasText(true)
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length
    }, 0)
  }

  return (
    <div className='grid w-full max-w-full min-w-0 shrink-0 gap-2 overflow-hidden px-0 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:gap-4 sm:px-1 sm:pb-0 md:pb-4'>
      <PromptInput
        className='max-w-full min-w-0 overflow-hidden'
        groupClassName='rounded-lg has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0 sm:rounded-xl'
        onSubmit={handleSubmit}
        accept='image/*,application/pdf,text/*,application/json'
        maxFiles={5}
        maxFileSize={20 * 1024 * 1024}
        onError={(err) => toast.error(err.message)}
      >
        <PlaygroundInputInner
          {...props}
          hasText={hasText}
          setHasText={updateHasText}
          textareaRef={textareaRef}
        />
      </PromptInput>

      <div className='block max-w-full min-w-0 overflow-hidden'>
        <Suggestions>
          {suggestions.map(({ icon: Icon, text: sugText, color, prompt }) => (
            <Suggestion
              className={`h-8 px-3 text-xs font-normal sm:px-4 sm:text-sm ${
                sugText === 'More' ? 'hidden sm:flex' : ''
              }`}
              key={sugText}
              onClick={() => handleSuggestionClick(prompt)}
              suggestion={sugText}
            >
              {Icon && <Icon size={16} style={{ color }} />}
              {t(sugText)}
            </Suggestion>
          ))}
        </Suggestions>
      </div>
    </div>
  )
}

function PlaygroundSubmitButton({
  disabled,
  hasText,
  isGenerating,
  onStop,
}: {
  disabled?: boolean
  hasText: boolean
  isGenerating?: boolean
  onStop?: () => void
}) {
  const { t } = useTranslation()
  const attachments = usePromptInputAttachments()
  const hasContent = hasText || attachments.files.length > 0

  if (isGenerating && onStop) {
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

interface PlaygroundInputInnerProps extends PlaygroundInputProps {
  hasText: boolean
  setHasText: (v: boolean) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
}

function PlaygroundInputInner({
  disabled,
  isGenerating,
  initialView = false,
  models,
  modelValue,
  onModelChange,
  isModelLoading = false,
  groups,
  groupValue,
  onGroupChange,
  onStop,
  hasText,
  setHasText,
  textareaRef,
  webSearchEnabled = false,
  webSearchSupport = 'unsupported',
  onWebSearchToggle,
}: PlaygroundInputInnerProps) {
  const { t } = useTranslation()
  const attachments = usePromptInputAttachments()

  const isModelSelectDisabled =
    disabled || isModelLoading || models.length === 0
  const isGroupSelectDisabled = disabled || groups.length === 0
  const inputMenuSide = initialView ? 'bottom' : 'top'

  return (
    <>
      <UploadedFilesPreview />

      <PromptInputTextarea
        autoComplete='off'
        autoCorrect='off'
        autoCapitalize='off'
        spellCheck={false}
        className='field-sizing-fixed max-h-28 min-h-12 px-3 text-base sm:field-sizing-content sm:max-h-48 sm:min-h-16 sm:px-5 md:text-base'
        disabled={disabled}
        onChange={(event) => setHasText(event.target.value.trim().length > 0)}
        placeholder={t('Ask anything')}
        ref={textareaRef}
      />

      <PromptInputFooter className='min-w-0 gap-1 p-1.5 sm:p-2.5'>
        <PromptInputTools>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <PromptInputButton
                  className='size-10 border font-medium sm:size-8'
                  disabled={disabled}
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
            disabled={disabled}
          />
        </PromptInputTools>

        <div className='flex min-w-0 shrink-0 items-center gap-1.5 md:gap-2'>
          <ModelGroupSelector
            selectedModel={modelValue}
            models={models}
            onModelChange={onModelChange}
            selectedGroup={groupValue}
            groups={groups}
            onGroupChange={onGroupChange}
            disabled={isModelSelectDisabled || isGroupSelectDisabled}
          />

          <PlaygroundSubmitButton
            disabled={disabled}
            hasText={hasText}
            isGenerating={isGenerating}
            onStop={onStop}
          />
        </div>
      </PromptInputFooter>
    </>
  )
}
