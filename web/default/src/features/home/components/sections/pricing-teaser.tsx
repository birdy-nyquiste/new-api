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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

export function PricingTeaser() {
  const { t } = useTranslation()

  const rows = [
    {
      label: t('Description'),
      pro: t('One AI account and connectivity to get started'),
      ultra: t('All three accounts, SIM data, and full API access'),
      custom: t('Other providers, multiple seats, or tailored quotas'),
    },
    {
      label: t('Price'),
      pro: '¥XXX / yr',
      ultra: '¥XXX / yr',
      custom: t('Contact us'),
    },
    {
      label: t('Billing'),
      pro: t('Annual · 微信 / 支付宝 / Card'),
      ultra: t('Annual · 微信 / 支付宝 / Card'),
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
      ultra: t('Included'),
      custom: t('Included'),
    },
    {
      label: t('Router credit'),
      pro: t('Included'),
      ultra: t('Included'),
      custom: t('Custom quota'),
    },
    {
      label: t('Model Lab'),
      pro: t('Included'),
      ultra: t('Included'),
      custom: t('Included'),
    },
    {
      label: t('Support'),
      pro: t('Standard'),
      ultra: t('Priority'),
      custom: t('Dedicated'),
    },
  ]

  const ctaHrefs = {
    pro: '/sign-up?plan=pro',
    ultra: '/sign-up?plan=ultra',
    custom: 'mailto:support@quantumnous.com',
  }

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-4xl'>

        {/* Header */}
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <p className='mb-3 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
            {t('Pricing')}
          </p>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t('Simple,')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('transparent')}
            </span>
            &nbsp;{t('plans.')}
          </h2>
          <p className='mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground'>
            {t(
              'All plans include Nyquiste Router credit and Model Lab access. Billed annually.'
            )}
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
                      render={<Link to={ctaHrefs.pro} />}
                    >
                      {t('Get Pro')}
                    </Button>
                  </td>
                  <td className='px-4 py-4'>
                    <Button
                      variant='outline'
                      className='min-h-[44px] w-full rounded-lg text-xs'
                      render={<Link to={ctaHrefs.ultra} />}
                    >
                      {t('Get Ultra')}
                    </Button>
                  </td>
                  <td className='px-4 py-4'>
                    <Button
                      variant='outline'
                      className='min-h-[44px] w-full rounded-lg text-xs'
                      render={<a href={ctaHrefs.custom} />}
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
