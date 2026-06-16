/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

export function PricingTeaser() {
  const { t } = useTranslation()

  const rows = [
    {
      label: t('Description'),
      pro: t('1 AI account (choose one of 3) + annual base plan'),
      ultra: t('3 mainstream AI accounts + annual base plan'),
      custom: t('Choose your own providers and subscription plans'),
    },
    {
      label: t('Price'),
      pro: `¥2,888 / ${t('yr')}`,
      ultra: `¥8,888 / ${t('yr')}`,
      custom: t('Contact us'),
    },
    {
      label: t('Billing'),
      pro: t('Annual'),
      ultra: t('Annual'),
      custom: t('Flexible'),
    },
    {
      label: t('AI Accounts'),
      pro: t('1 account (choice)'),
      ultra: 'OpenAI + Claude + Gemini',
      custom: t('Any provider'),
    },
    {
      label: t('SIM / eSIM'),
      pro: t('Add-on available'),
      ultra: t('50 GB global data (add-on available)'),
      custom: t('50 GB global data (add-on available)'),
    },
    {
      label: t('API Credit'),
      pro: '$50',
      ultra: '$150',
      custom: t('Add-on available'),
    },
    {
      label: t('Support'),
      pro: t('Standard'),
      ultra: t('Priority'),
      custom: t('Dedicated'),
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-5xl'>

        {/* Header */}
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('All-in-one bundles,')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('your choice.')}
            </span>
          </h2>
          <p className='mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground'>
            {t('All plans are billed annually.')}
          </p>
        </AnimateInView>

        {/* Table — horizontal scroll on mobile */}
        <AnimateInView animation='fade-up' delay={100}>
          <div className='overflow-x-auto rounded-xl border border-border'>
            <table className='w-full min-w-[560px] border-collapse text-sm'>
              <thead>
                <tr className='border-b border-border bg-muted/40'>
                  <th className='w-[30%] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60' />
                  {['Pro', 'Ultra', t('Custom')].map((plan) => (
                    <th
                      key={plan}
                      className='px-4 py-3 text-left text-sm font-extrabold tracking-tight text-foreground'
                    >
                      {plan}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className='border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors'
                  >
                    <td className='px-4 py-3 text-xs font-semibold text-muted-foreground/70'>
                      {row.label}
                    </td>
                    <td className='px-4 py-3 text-foreground'>{row.pro}</td>
                    <td className='px-4 py-3 text-foreground'>{row.ultra}</td>
                    <td className='px-4 py-3 text-foreground'>{row.custom}</td>
                  </tr>
                ))}
                {/* CTA row */}
                <tr className='border-t border-border bg-muted/20'>
                  <td className='px-4 py-4' />
                  <td className='px-4 py-4'>
                    <Button
                      variant='outline'
                      className='min-h-[44px] w-full rounded-lg text-xs'
                    >
                      {t('Get Pro')}
                    </Button>
                  </td>
                  <td className='px-4 py-4'>
                    <Button
                      className='min-h-[44px] w-full rounded-lg text-xs'
                    >
                      {t('Get Ultra')}
                    </Button>
                  </td>
                  <td className='px-4 py-4'>
                    <Button
                      variant='outline'
                      className='min-h-[44px] w-full rounded-lg text-xs'
                      onClick={() => window.location.href = 'mailto:admin@nyquiste.com'}
                    >
                      {t('Contact us')}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
