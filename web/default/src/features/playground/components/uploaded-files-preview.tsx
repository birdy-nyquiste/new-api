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
import { FileIcon, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { usePromptInputAttachments } from '@/components/ai-elements/prompt-input'

export function UploadedFilesPreview() {
  const { t } = useTranslation()
  const attachments = usePromptInputAttachments()

  if (attachments.files.length === 0) return null

  return (
    <div
      data-align='block-start'
      className='flex w-full flex-wrap justify-start gap-2 px-5 pt-4 pb-2'
    >
      {attachments.files.map((file) => {
        const isImage = file.mediaType?.startsWith('image/') && file.url
        const label = file.filename || (isImage ? t('Image') : t('Attachment'))
        const extension = getFileExtension(file.filename)

        return (
          <div
            key={file.id}
            className='bg-muted/40 flex w-fit max-w-full min-w-0 items-center gap-2 rounded-lg border p-2 sm:max-w-72'
          >
            {isImage ? (
              <img
                alt={label}
                className='size-10 shrink-0 rounded object-cover'
                src={file.url}
              />
            ) : (
              <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded'>
                <FileIcon className='size-5' />
              </div>
            )}
            <div className='min-w-0 flex-1'>
              <div className='truncate text-xs font-medium'>{label}</div>
              {extension && (
                <div className='text-muted-foreground truncate font-mono text-[10px]'>
                  {extension}
                </div>
              )}
            </div>
            <Button
              aria-label={t('Remove attachment')}
              className='size-7 shrink-0'
              onClick={() => attachments.remove(file.id)}
              size='icon'
              type='button'
              variant='ghost'
            >
              <XIcon className='size-4' />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

function getFileExtension(filename?: string) {
  if (!filename) return ''
  const lastSegment = filename.split('/').pop() || filename
  const dotIndex = lastSegment.lastIndexOf('.')
  if (dotIndex < 0 || dotIndex === lastSegment.length - 1) return ''
  return lastSegment.slice(dotIndex + 1).toUpperCase()
}
