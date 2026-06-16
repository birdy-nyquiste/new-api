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
import { BookOpen, BriefcaseBusiness, Code2, PenLine, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { cn } from '@/lib/utils'

export function AudienceUseCases() {
  const { t } = useTranslation()

  const useCases = [
    {
      icon: UserRound,
      title: t('Everyday AI users'),
      body: t(
        'For people who want ChatGPT, Claude, or Gemini without studying overseas accounts, payment methods, verification, and connection setup.'
      ),
      tags: [t('Fast start'), t('Less setup'), t('Ready to use')],
    },
    {
      icon: PenLine,
      title: t('Creators and media operators'),
      body: t(
        'Use multiple models for topic selection, writing, rewriting, translation, title optimization, and script planning.'
      ),
      tags: [t('Writing'), t('Editing'), t('Multi-model comparison')],
    },
    {
      icon: BookOpen,
      title: t('Students and researchers'),
      body: t(
        'Configure tools for paper reading, English writing, literature summaries, long PDF analysis, and academic organization.'
      ),
      tags: [t('Papers'), t('Long documents'), t('Research notes')],
    },
    {
      icon: Code2,
      title: t('Developers and technical users'),
      body: t(
        'Combine tools for coding, debugging, technical planning, Cursor workflows, and long-context code understanding.'
      ),
      tags: [t('Code'), t('Debugging'), t('Cursor')],
    },
    {
      icon: BriefcaseBusiness,
      title: t('Small teams and companies'),
      body: t(
        'Plan accounts, subscriptions, quota, renewal, and usage rules centrally instead of having every member subscribe alone.'
      ),
      tags: [t('Team setup'), t('Quota planning'), t('Unified management')],
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-10 max-w-2xl'>
          <p className='mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase'>
            {t('Use cases')}
          </p>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('Start broad, then configure for your workflow')}
          </h2>
          <p className='mt-4 text-sm leading-7 text-muted-foreground'>
            {t(
              'Most users start with the same problem: they want reliable access to global AI. The right model mix depends on what they do every day.'
            )}
          </p>
        </AnimateInView>

        <div className='grid gap-px overflow-hidden rounded-xl border border-border/40 bg-border/40 md:grid-cols-2 lg:grid-cols-3'>
          {useCases.map((item, index) => {
            const Icon = item.icon

            return (
              <AnimateInView
                key={item.title}
                delay={index * 70}
                animation='scale-in'
                className={cn(
                  'min-w-0 bg-background p-6 transition-colors duration-300 hover:bg-muted/20',
                  index === 0 && 'lg:col-span-2'
                )}
              >
                <div className='mb-5 flex items-center gap-3'>
                  <div className='flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground'>
                    <Icon className='size-4' />
                  </div>
                  <h3 className='min-w-0 text-sm font-semibold text-foreground break-words'>
                    {item.title}
                  </h3>
                </div>
                <p className='text-xs leading-6 text-muted-foreground break-words'>
                  {item.body}
                </p>
                <div className='mt-5 flex flex-wrap gap-2'>
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className='rounded-md border border-border/60 bg-muted/20 px-2 py-1 text-[11px] font-medium text-muted-foreground'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </AnimateInView>
            )
          })}
        </div>
      </div>
    </section>
  )
}
