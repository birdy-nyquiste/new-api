# Home Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four existing generic home page sections with six new Bundle-First landing sections that communicate the Nyquiste product clearly, drive signups via Model Lab, and deliver a clean confident visual design with full dark mode and mobile-first responsive support.

**Architecture:** Six new section components replace the four existing ones inside `web/default/src/features/home/components/sections/`. Two shared sub-components (`ManifestRow`, `ProviderCard`) live in `web/default/src/features/home/components/`. The `features/home/index.tsx` orchestrator is preserved verbatim except the import list. `features/home/components/index.ts` barrel is updated. No new routing, no new stores, no new API calls.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, `@fontsource-variable/plus-jakarta-sans` (new dep), Lora Variable (already installed), i18next / react-i18next, TanStack Router (`<Link>`), Lucide React icons, existing `AnimateInView` scroll component, existing `Button` component.

**Note on tests:** The project has no React component test runner (no Vitest / Jest configured). Verification steps use TypeScript type-checking and visual inspection in the dev server.

---

### Task 1: Install Plus Jakarta Sans font

**Files:**
- Modify: `web/default/package.json` (via bun)
- Modify: `web/default/src/styles/index.css` (add import)
- Modify: `web/default/src/styles/theme.css` (register CSS variable)

- [ ] **Step 1: Install the package**

Run from `web/default/`:
```bash
bun add @fontsource-variable/plus-jakarta-sans
```
Expected: `node_modules/@fontsource-variable/plus-jakarta-sans` appears, `package.json` updated.

- [ ] **Step 2: Import the font in index.css**

In `web/default/src/styles/index.css`, add the import directly after the Lora import (around line 30):

```css
@import '@fontsource-variable/lora';
@import '@fontsource-variable/plus-jakarta-sans';
```

- [ ] **Step 3: Register the CSS variable in theme.css**

In `web/default/src/styles/theme.css`, inside the `@theme inline {` block (after the existing `--font-manrope` entry), add:

```css
  --font-landing:
    'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif;
```

After this change the `@theme inline` block will have a `--font-landing` entry that Tailwind exposes as the `font-landing` utility class.

- [ ] **Step 4: Verify TypeScript compilation**

Run from `web/default/`:
```bash
bun run build 2>&1 | tail -20
```
Expected: build succeeds (exit 0), no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add web/default/package.json web/default/bun.lockb web/default/src/styles/index.css web/default/src/styles/theme.css
git commit -m "feat(home): add Plus Jakarta Sans font for landing page"
```

---

### Task 2: ManifestRow sub-component

**Files:**
- Create: `web/default/src/features/home/components/manifest-row.tsx`

- [ ] **Step 1: Create the file**

Create `web/default/src/features/home/components/manifest-row.tsx` with this content:

```tsx
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
import type { ReactNode } from 'react'

interface ManifestRowProps {
  icon: ReactNode
  title: string
  description: string
  tag: string
}

export function ManifestRow({ icon, title, description, tag }: ManifestRowProps) {
  return (
    <div className='flex items-start gap-3 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border'>
      <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-border text-muted-foreground'>
        {icon}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <span className='text-sm font-semibold tracking-tight text-foreground'>
            {title}
          </span>
          <span className='rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70'>
            {tag}
          </span>
        </div>
        <p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>
          {description}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/home/components/manifest-row.tsx
git commit -m "feat(home): add ManifestRow sub-component"
```

---

### Task 3: ProviderCard sub-component

**Files:**
- Create: `web/default/src/features/home/components/provider-card.tsx`

- [ ] **Step 1: Create the file**

Create `web/default/src/features/home/components/provider-card.tsx`:

```tsx
/*
Copyright (C) 2023-2026 QuantumNous
... (same license header as above)
*/
interface ModelItem {
  name: string
  category: string
}

interface ProviderCardProps {
  name: string
  plan: string
  models: ModelItem[]
  description: string
}

export function ProviderCard({ name, plan, models, description }: ProviderCardProps) {
  return (
    <div className='flex flex-col p-5'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
        <span className='text-lg font-extrabold tracking-tight text-foreground'>
          {name}
        </span>
        <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary'>
          {plan}
        </span>
      </div>
      <div className='mb-4 flex-1 space-y-1.5'>
        {models.map((model) => (
          <div
            key={model.name}
            className='flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5'
          >
            <span className='text-xs font-medium text-foreground'>{model.name}</span>
            <span className='flex-shrink-0 text-[10px] text-muted-foreground/70'>
              {model.category}
            </span>
          </div>
        ))}
      </div>
      <p className='border-t border-border pt-3 text-[11px] italic leading-relaxed text-muted-foreground/70'>
        {description}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/home/components/provider-card.tsx
git commit -m "feat(home): add ProviderCard sub-component"
```

---

### Task 4: Hero section

**Files:**
- Modify: `web/default/src/features/home/components/sections/hero.tsx` (full replacement)

- [ ] **Step 1: Replace hero.tsx**

Overwrite `web/default/src/features/home/components/sections/hero.tsx` with:

```tsx
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
import { Monitor, Wifi, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ManifestRow } from '../manifest-row'

interface HeroProps {
  isAuthenticated?: boolean
}

export function Hero({ isAuthenticated }: HeroProps) {
  const { t } = useTranslation()

  return (
    <section className='font-landing overflow-hidden px-6 py-16 md:py-24 lg:py-28'>
      <div className='mx-auto max-w-5xl'>
        <div className='grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-12'>

          {/* Left column */}
          <div className='flex flex-col items-start text-left'>

            {/* Free credits badge */}
            {!isAuthenticated && (
              <div
                className='landing-animate-fade-up mb-6 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground'
                style={{ animationDelay: '0ms' }}
              >
                <span className='h-1.5 w-1.5 rounded-full bg-primary' aria-hidden />
                {t('New accounts get free credits')}
              </div>
            )}

            {/* Headline */}
            <h1
              className='landing-animate-fade-up text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold leading-[1.1] tracking-tight text-foreground break-words'
              style={{ animationDelay: '60ms' }}
            >
              {t('Global AI,')}&nbsp;
              <span
                className='font-serif italic font-normal text-muted-foreground'
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {t('without the setup.')}
              </span>
            </h1>

            {/* Subtext */}
            <p
              className='landing-animate-fade-up mt-5 max-w-md text-sm leading-relaxed text-muted-foreground'
              style={{ animationDelay: '120ms' }}
            >
              {t(
                'One subscription covers your AI accounts, global mobile data, and API access — pre-configured, compliant, and ready on day one.'
              )}
            </p>

            {/* CTAs */}
            <div
              className='landing-animate-fade-up mt-8 flex w-full flex-wrap gap-3 sm:w-auto'
              style={{ animationDelay: '180ms' }}
            >
              <Button
                className='min-h-[44px] flex-1 rounded-lg sm:flex-none'
                render={<Link to={isAuthenticated ? '/playground' : '/sign-up'} />}
              >
                {isAuthenticated ? t('Open Model Lab →') : t('Get started free →')}
              </Button>
              <Button
                variant='outline'
                className='min-h-[44px] flex-1 rounded-lg border-border/50 sm:flex-none'
                render={<Link to='/pricing' />}
              >
                {t('View pricing')}
              </Button>
            </div>

            {/* Trust chips */}
            <div
              className='landing-animate-fade-up mt-6 flex flex-wrap gap-2'
              style={{ animationDelay: '240ms' }}
            >
              {['GPT-4o', 'Claude Sonnet', 'Gemini 2.0'].map((model) => (
                <span
                  key={model}
                  className='rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground/70'
                >
                  {model}
                </span>
              ))}
              <span className='rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground/70'>
                {t('+ more')}
              </span>
            </div>
          </div>

          {/* Right column: bundle manifest panel */}
          <div
            className='landing-animate-fade-up rounded-xl border border-border bg-muted/40 p-5'
            style={{ animationDelay: '80ms' }}
          >
            <p className='mb-3 text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground/60'>
              {t("What's in the package")}
            </p>
            <ManifestRow
              icon={<Monitor size={16} />}
              title={t('AI Accounts')}
              description={t(
                'Official access to OpenAI, Claude, Gemini — pre-configured.'
              )}
              tag={t('Annual')}
            />
            <ManifestRow
              icon={<Wifi size={16} />}
              title={t('SIM / eSIM')}
              description={t(
                'Global data via China Telecom HK. Stable, compliant internet routing — no VPN needed.'
              )}
              tag={t('Flexible')}
            />
            <ManifestRow
              icon={<Zap size={16} />}
              title={t('API Router')}
              description={t(
                'One API key for all providers. Works with any tool or IDE that supports OpenAI format.'
              )}
              tag={t('Included')}
            />
            <p className='mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground/60'>
              {t(
                'Sign up to explore Model Lab free — compare models side by side, then choose a plan.'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/home/components/sections/hero.tsx
git commit -m "feat(home): replace Hero section with Bundle-First design"
```

---

### Task 5: Pain vs Solution section

**Files:**
- Create: `web/default/src/features/home/components/sections/pain-solution.tsx`

- [ ] **Step 1: Create the file**

Create `web/default/src/features/home/components/sections/pain-solution.tsx`:

```tsx
/*
Copyright (C) 2023-2026 QuantumNous
... (standard license header)
*/
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function PainVsSolution() {
  const { t } = useTranslation()

  const painItems = [
    t('Apply for an overseas email and phone number just to sign up'),
    t('Need a foreign credit card — or find someone abroad to pay for you'),
    t("Set up a VPN — and hope it doesn't get blocked mid-session"),
    t('Repeat for every provider: ChatGPT, Claude, Gemini separately'),
  ]

  const solutionItems = [
    {
      title: t('We create and subscribe the accounts for you'),
      body: t(
        'Receive your OpenAI, Claude, or Gemini login — just sign in and use it.'
      ),
      chips: null,
    },
    {
      title: t('Pay your way — local or international'),
      body: null,
      chips: ['微信支付', '支付宝', '银行卡', 'Credit card'],
    },
    {
      title: t('SIM / eSIM for stable, compliant connectivity'),
      body: t(
        'China Telecom HK routing — reliable access without consumer VPN risk'
      ),
      chips: null,
    },
    {
      title: t('Nyquiste Router credit included'),
      body: t(
        'Use any AI model via base URL + API key — works with Cursor, VS Code, and any OpenAI-compatible tool'
      ),
      chips: null,
    },
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-4xl'>

        {/* Header */}
        <AnimateInView className='mb-12 text-center' animation='fade-up'>
          <p className='mb-3 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
            {t('Why Nyquiste')}
          </p>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground break-words'>
            {t('Getting global AI')}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('used to mean')}
            </span>
            <br />
            {t('jumping through hoops.')}
          </h2>
        </AnimateInView>

        {/* Three-column grid */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-0'>

          {/* Before */}
          <AnimateInView
            className='md:border-r md:border-border md:pr-8'
            animation='fade-right'
          >
            <p className='mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground'>
              <span className='h-px w-4 bg-muted-foreground/40' aria-hidden />
              {t('Without Nyquiste')}
            </p>
            <ol className='space-y-3'>
              {painItems.map((item, i) => (
                <li
                  key={i}
                  className='flex items-start gap-2.5 text-sm text-muted-foreground line-through decoration-muted-foreground/40'
                >
                  <span className='mt-0.5 flex-shrink-0 text-xs font-bold text-muted-foreground/40'>
                    {i + 1}.
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </AnimateInView>

          {/* Arrow divider */}
          <div className='flex items-center justify-center md:px-6'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground/50'>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* After */}
          <AnimateInView className='md:pl-8' animation='fade-left'>
            <p className='mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
              <span className='h-px w-4 bg-primary/50' aria-hidden />
              {t('With Nyquiste')}
            </p>
            <ol className='space-y-4'>
              {solutionItems.map((item, i) => (
                <li key={i} className='text-sm'>
                  <p className='font-semibold text-foreground'>{item.title}</p>
                  {item.body && (
                    <p className='mt-0.5 text-muted-foreground'>{item.body}</p>
                  )}
                  {item.chips && (
                    <div className='mt-1.5 flex flex-wrap gap-1.5'>
                      {item.chips.map((chip) => (
                        <span
                          key={chip}
                          className='rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground'
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </AnimateInView>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/home/components/sections/pain-solution.tsx
git commit -m "feat(home): add Pain vs Solution section"
```

---

### Task 6: Model Coverage section

**Files:**
- Create: `web/default/src/features/home/components/sections/model-coverage.tsx`

- [ ] **Step 1: Create the file**

Create `web/default/src/features/home/components/sections/model-coverage.tsx`:

```tsx
/*
Copyright (C) 2023-2026 QuantumNous
... (standard license header)
*/
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { ProviderCard } from '../provider-card'

export function ModelCoverage() {
  const { t } = useTranslation()

  const providers = [
    {
      name: 'OpenAI',
      plan: 'ChatGPT Plus / Pro',
      models: [
        { name: 'GPT-4o', category: t('Flagship') },
        { name: 'o3 / o4-mini', category: t('Reasoning') },
        { name: 'GPT-4.1', category: t('Latest') },
        { name: 'DALL·E 3 · Sora', category: t('Image / Video') },
      ],
      description: t(
        'The most widely used AI platform — ideal for writing, coding, and multimodal tasks.'
      ),
    },
    {
      name: 'Anthropic',
      plan: 'Claude Pro',
      models: [
        { name: 'Claude Opus 4', category: t('Most capable') },
        { name: 'Claude Sonnet 4.6', category: t('Balanced') },
        { name: 'Claude Haiku 4.5', category: t('Fast') },
      ],
      description: t(
        'Exceptional at nuanced reasoning, long documents, and safety-focused tasks.'
      ),
    },
    {
      name: 'Google',
      plan: 'Gemini Advanced',
      models: [
        { name: 'Gemini 2.5 Pro', category: t('Flagship') },
        { name: 'Gemini 2.0 Flash', category: t('Fast') },
        { name: 'NotebookLM Plus', category: t('Research') },
      ],
      description: t(
        'Deep integration with Google Search and a 1M-token context window for large-scale research.'
      ),
    },
  ]

  const otherProviders = ['Perplexity', 'Midjourney', 'Grok / xAI']

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-4xl'>

        {/* Header */}
        <AnimateInView className='mb-10 text-center' animation='fade-up'>
          <p className='mb-3 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
            {t('What we support')}
          </p>
          <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
            {t("The world's leading AI,")}&nbsp;
            <span
              className='italic font-normal text-muted-foreground'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('ready to use.')}
            </span>
          </h2>
          <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground'>
            {t(
              'We source and manage official subscriptions to the most capable AI models. Choose what you need — or mix and match.'
            )}
          </p>
        </AnimateInView>

        {/* Provider grid */}
        <AnimateInView animation='fade-up' delay={100}>
          <div className='overflow-hidden rounded-xl border border-border'>
            <div className='grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0'>
              {providers.map((provider) => (
                <ProviderCard key={provider.name} {...provider} />
              ))}
            </div>
          </div>
        </AnimateInView>

        {/* Other providers row */}
        <AnimateInView
          className='mt-6 flex flex-wrap items-center gap-2 justify-center'
          animation='fade-up'
          delay={200}
        >
          <span className='text-xs text-muted-foreground'>
            {t('Need other providers?')}
          </span>
          {otherProviders.map((p) => (
            <span
              key={p}
              className='rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground/70'
            >
              {p}
            </span>
          ))}
          <a
            href='mailto:support@quantumnous.com'
            className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors'
          >
            {t('Contact us →')}
          </a>
        </AnimateInView>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/home/components/sections/model-coverage.tsx
git commit -m "feat(home): add Model Coverage section"
```

---

### Task 7: Model Lab Spotlight section

**Files:**
- Create: `web/default/src/features/home/components/sections/model-lab-spotlight.tsx`

- [ ] **Step 1: Create the file**

Create `web/default/src/features/home/components/sections/model-lab-spotlight.tsx`:

```tsx
/*
Copyright (C) 2023-2026 QuantumNous
... (standard license header)
*/
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

export function ModelLabSpotlight() {
  const { t } = useTranslation()

  const features = [
    t('Side-by-side responses in real time'),
    t('Switch models without retyping your prompt'),
    t('Token count and response time for each model'),
  ]

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <div className='mx-auto max-w-4xl'>
        <AnimateInView animation='fade-up'>
          <div className='grid grid-cols-1 items-center gap-8 rounded-2xl border border-border p-8 md:grid-cols-[1fr_auto] md:gap-12 md:p-12'>

            {/* Left: copy */}
            <div>
              <p className='mb-3 text-[10px] font-bold uppercase tracking-[2px] text-primary'>
                {t('Model Lab')}
              </p>
              <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
                {t('Compare every model,')}&nbsp;
                <span
                  className='italic font-normal text-muted-foreground'
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {t('with one prompt.')}
                </span>
              </h2>
              <p className='mt-4 max-w-[46ch] text-sm leading-relaxed text-muted-foreground'>
                {t(
                  'Send the same message to GPT-4o, Claude, and Gemini simultaneously. See how each model thinks, writes, and reasons — then decide which fits your workflow.'
                )}
              </p>
              <ul className='mt-5 space-y-2'>
                {features.map((feature) => (
                  <li
                    key={feature}
                    className='flex items-center gap-2.5 text-sm text-muted-foreground'
                  >
                    <span
                      className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary'
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CTA */}
            <div className='flex flex-col items-center gap-3 md:min-w-[180px]'>
              <span className='rounded-full border border-border px-3 py-1.5 text-center text-[10px] font-semibold text-muted-foreground'>
                {t('New accounts get free credits')}
              </span>
              <Button
                className='min-h-[44px] w-full rounded-lg'
                render={<Link to='/playground' />}
              >
                {t('Try Model Lab →')}
              </Button>
              <Link
                to='/pricing'
                className='text-[11px] text-muted-foreground/60 underline underline-offset-2 decoration-border hover:text-muted-foreground transition-colors'
              >
                {t('or view pricing first')}
              </Link>
            </div>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/home/components/sections/model-lab-spotlight.tsx
git commit -m "feat(home): add Model Lab Spotlight section"
```

---

### Task 8: Pricing Teaser section

**Files:**
- Create: `web/default/src/features/home/components/sections/pricing-teaser.tsx`

- [ ] **Step 1: Create the file**

Create `web/default/src/features/home/components/sections/pricing-teaser.tsx`:

```tsx
/*
Copyright (C) 2023-2026 QuantumNous
... (standard license header)
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
```

- [ ] **Step 2: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/home/components/sections/pricing-teaser.tsx
git commit -m "feat(home): add Pricing Teaser section"
```

---

### Task 9: Final CTA section

**Files:**
- Create: `web/default/src/features/home/components/sections/final-cta.tsx`

- [ ] **Step 1: Create the file**

Create `web/default/src/features/home/components/sections/final-cta.tsx`:

```tsx
/*
Copyright (C) 2023-2026 QuantumNous
... (standard license header)
*/
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

interface FinalCTAProps {
  isAuthenticated?: boolean
}

export function FinalCTA({ isAuthenticated }: FinalCTAProps) {
  const { t } = useTranslation()

  if (isAuthenticated) {
    return null
  }

  return (
    <section className='font-landing border-t border-border/50 px-6 py-16 md:py-20 lg:py-24'>
      <AnimateInView className='mx-auto max-w-2xl text-center' animation='scale-in'>
        <h2 className='text-[clamp(1.5rem,3.5vw,2.2rem)] font-extrabold leading-tight tracking-tight text-foreground'>
          {t('Global AI,')}&nbsp;
          <span
            className='italic font-normal text-muted-foreground'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('starting today.')}
          </span>
        </h2>
        <p className='mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground'>
          {t(
            'Create your account, get free credits, and try Model Lab before committing to a plan.'
          )}
        </p>
        <div className='mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
          <Button
            className='min-h-[44px] w-full rounded-lg sm:w-auto'
            render={<Link to='/sign-up' />}
          >
            {t('Get started free →')}
          </Button>
          <Button
            variant='outline'
            className='min-h-[44px] w-full rounded-lg border-border/50 sm:w-auto'
            render={<Link to='/pricing' />}
          >
            {t('View pricing')}
          </Button>
        </div>
      </AnimateInView>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/home/components/sections/final-cta.tsx
git commit -m "feat(home): add Final CTA section"
```

---

### Task 10: Wire up — barrel exports and Home orchestrator

**Files:**
- Modify: `web/default/src/features/home/components/index.ts`
- Modify: `web/default/src/features/home/index.tsx`

- [ ] **Step 1: Update the barrel export**

Replace the full contents of `web/default/src/features/home/components/index.ts` with:

```ts
/*
Copyright (C) 2023-2026 QuantumNous
... (standard license header)
*/
export { FinalCTA } from './sections/final-cta'
export { Hero } from './sections/hero'
export { ModelCoverage } from './sections/model-coverage'
export { ModelLabSpotlight } from './sections/model-lab-spotlight'
export { PainVsSolution } from './sections/pain-solution'
export { PricingTeaser } from './sections/pricing-teaser'
```

- [ ] **Step 2: Update Home index.tsx**

Replace only the import line and the default landing section in `web/default/src/features/home/index.tsx`. The file must keep ALL of the following untouched:
- The `useHomePageContent` logic and loading/custom-page branches
- `<PublicLayout showMainContainer={false}>` as the outer wrapper — this renders `PublicHeader`, which is fully admin-controlled (dynamic nav links via `useTopNavLinks()`, theme switch and notifications toggled via `parseHeaderNavModulesFromStatus()`, site name and logo via `useSystemConfig()`). Do NOT replace or remove this wrapper.

Change only the named import and the JSX in the default return.

Find this block near the top of the file:
```ts
import { CTA, Features, Hero, HowItWorks } from './components'
```
Replace with:
```ts
import {
  FinalCTA,
  Hero,
  ModelCoverage,
  ModelLabSpotlight,
  PainVsSolution,
  PricingTeaser,
} from './components'
```

Find the default return at the bottom:
```tsx
  return (
    <PublicLayout showMainContainer={false}>
      <Hero isAuthenticated={isAuthenticated} />
      <Features />
      <HowItWorks />
      <CTA isAuthenticated={isAuthenticated} />
      <Footer />
    </PublicLayout>
  )
```
Replace with:
```tsx
  return (
    <PublicLayout showMainContainer={false}>
      <Hero isAuthenticated={isAuthenticated} />
      <PainVsSolution />
      <ModelCoverage />
      <ModelLabSpotlight />
      <PricingTeaser />
      <FinalCTA isAuthenticated={isAuthenticated} />
      <Footer />
    </PublicLayout>
  )
```

- [ ] **Step 3: Type-check**

```bash
cd web/default && bun run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: no output.

- [ ] **Step 4: Verify in dev server**

If the dev server is running at `http://localhost:3001/`, navigate to `/`. You should see:
1. Hero section with manifest panel on the right (on desktop)
2. Pain vs Solution section below
3. Model Coverage grid
4. Model Lab callout
5. Pricing table
6. Final CTA
7. Footer

If the dev server is not running, start it:
```bash
cd web/default && bun run dev
```

- [ ] **Step 5: Commit**

```bash
git add web/default/src/features/home/components/index.ts web/default/src/features/home/index.tsx
git commit -m "feat(home): wire up new sections in Home orchestrator"
```

---

### Task 11: i18n strings

**Files:**
- Modify: `web/default/src/i18n/locales/zh.json`
- Modify: `web/default/src/i18n/locales/en.json`
- Modify: `web/default/src/i18n/locales/fr.json`, `ru.json`, `ja.json`, `vi.json` (auto-generated stubs via sync script)

**Note:** zh.json values are the canonical Chinese copy. en.json values are English translations of those Chinese strings. The i18n key (left side) is the English-readable developer identifier matching what's used in `t('...')` calls in the components. For keys that are already in English (like 'Loading...' or model names), the zh.json value is the Chinese translation.

- [ ] **Step 1: Add new keys to zh.json**

Open `web/default/src/i18n/locales/zh.json` and add the following entries (add them anywhere in the JSON object — alphabetical order is preferred but not required):

```json
"New accounts get free credits": "新账户赠送免费额度",
"Global AI,": "全球 AI，",
"without the setup.": "轻松上手。",
"One subscription covers your AI accounts, global mobile data, and API access — pre-configured, compliant, and ready on day one.": "一次订阅，覆盖 AI 账户、全球移动数据与 API 访问——预配置、合规，开箱即用。",
"Get started free →": "免费开始 →",
"Open Model Lab →": "打开 Model Lab →",
"View pricing": "查看定价",
"+ more": "+ 更多",
"What's in the package": "套餐包含",
"AI Accounts": "AI 账户",
"Official access to OpenAI, Claude, Gemini — pre-configured.": "OpenAI、Claude、Gemini 官方账户——开箱即用。",
"Annual": "按年",
"SIM / eSIM": "SIM / eSIM",
"Global data via China Telecom HK. Stable, compliant internet routing — no VPN needed.": "中国电信香港全球流量，稳定合规，无需 VPN。",
"Flexible": "灵活计费",
"API Router": "API 路由",
"One API key for all providers. Works with any tool or IDE that supports OpenAI format.": "一个 API Key 访问所有模型，兼容所有支持 OpenAI 格式的工具与 IDE。",
"Included": "已包含",
"Sign up to explore Model Lab free — compare models side by side, then choose a plan.": "注册即可免费体验 Model Lab——并排对比各大模型，再决定是否购买。",
"Why Nyquiste": "为什么选择 Nyquiste",
"Getting global AI": "使用全球 AI",
"used to mean": "曾意味着",
"jumping through hoops.": "繁琐的手续。",
"Without Nyquiste": "没有 Nyquiste",
"Apply for an overseas email and phone number just to sign up": "申请海外邮箱和手机号才能注册",
"Need a foreign credit card — or find someone abroad to pay for you": "需要境外信用卡，或托海外朋友代付",
"Set up a VPN — and hope it doesn't get blocked mid-session": "自行搭建 VPN，还要祈祷不在用的时候断线",
"Repeat for every provider: ChatGPT, Claude, Gemini separately": "每家都要重复一遍：ChatGPT、Claude、Gemini 各搞一次",
"With Nyquiste": "有了 Nyquiste",
"We create and subscribe the accounts for you": "我们替你注册并订阅账户",
"Receive your OpenAI, Claude, or Gemini login — just sign in and use it.": "直接收到 OpenAI、Claude 或 Gemini 的登录凭据，登录即用。",
"Pay your way — local or international": "随心支付——国内外方式均可",
"SIM / eSIM for stable, compliant connectivity": "SIM / eSIM，稳定合规的网络连接",
"China Telecom HK routing — reliable access without consumer VPN risk": "中国电信香港线路——稳定访问，无消费级 VPN 风险",
"Nyquiste Router credit included": "Nyquiste Router 额度已包含",
"Use any AI model via base URL + API key — works with Cursor, VS Code, and any OpenAI-compatible tool": "通过 base URL + API Key 使用任意模型——兼容 Cursor、VS Code 及所有 OpenAI 格式工具",
"What we support": "我们支持的模型",
"The world's leading AI,": "全球顶尖 AI，",
"ready to use.": "随时可用。",
"We source and manage official subscriptions to the most capable AI models. Choose what you need — or mix and match.": "我们代为采购并管理全球顶尖 AI 模型的官方订阅。按需选择，自由搭配。",
"Flagship": "旗舰",
"Reasoning": "推理",
"Latest": "最新",
"Image / Video": "图像 / 视频",
"Most capable": "最强",
"Balanced": "均衡",
"Fast": "极速",
"Research": "研究",
"The most widely used AI platform — ideal for writing, coding, and multimodal tasks.": "全球最广泛使用的 AI 平台——适合写作、编程与多模态任务。",
"Exceptional at nuanced reasoning, long documents, and safety-focused tasks.": "擅长细致推理、长文档处理与安全导向任务。",
"Deep integration with Google Search and a 1M-token context window for large-scale research.": "深度整合 Google 搜索，百万 token 上下文，适合大规模研究。",
"Need other providers?": "需要其他服务商？",
"Contact us →": "联系我们 →",
"Model Lab": "Model Lab",
"Compare every model,": "并排对比所有模型，",
"with one prompt.": "只需一条提示词。",
"Send the same message to GPT-4o, Claude, and Gemini simultaneously. See how each model thinks, writes, and reasons — then decide which fits your workflow.": "同时向 GPT-4o、Claude 和 Gemini 发送相同的消息，观察每个模型的思考方式、写作风格与推理过程——再决定哪个最适合你的工作流。",
"Side-by-side responses in real time": "实时并排对比响应",
"Switch models without retyping your prompt": "无需重新输入，随时切换模型",
"Token count and response time for each model": "显示每个模型的 token 数量与响应时间",
"New accounts get free credits": "新账户赠送免费额度",
"Try Model Lab →": "体验 Model Lab →",
"or view pricing first": "或先查看定价",
"Pricing": "定价",
"Simple,": "简洁，",
"transparent": "透明",
"plans.": "的套餐。",
"All plans include Nyquiste Router credit and Model Lab access. Billed annually.": "所有套餐均含 Nyquiste Router 额度与 Model Lab 访问权限，按年计费。",
"Description": "简介",
"Price": "价格",
"Billing": "计费方式",
"One AI account and connectivity to get started": "1 个 AI 账户 + 网络接入，快速起步",
"All three accounts, SIM data, and full API access": "三大 AI 账户 + SIM 流量 + 完整 API 访问",
"Other providers, multiple seats, or tailored quotas": "其他服务商、多席位或自定义额度",
"Contact us": "联系我们",
"Annual · 微信 / 支付宝 / Card": "按年 · 微信 / 支付宝 / 银行卡",
"1 account (choice)": "1 个账户（自选）",
"Any provider": "任意服务商",
"Add-on available": "可选附加",
"Custom quota": "自定义额度",
"Standard": "标准",
"Priority": "优先",
"Dedicated": "专属",
"Get Pro": "选择 Pro",
"Get Ultra": "选择 Ultra",
"Custom": "定制",
"starting today.": "从今天开始。",
"Create your account, get free credits, and try Model Lab before committing to a plan.": "注册账户，获取免费额度，在决定套餐前先体验 Model Lab。"
```

- [ ] **Step 2: Add English translations to en.json**

Open `web/default/src/i18n/locales/en.json` and add the same keys with English values. For keys that are already English sentences, the value is identical to the key:

```json
"New accounts get free credits": "New accounts get free credits",
"Global AI,": "Global AI,",
"without the setup.": "without the setup.",
"One subscription covers your AI accounts, global mobile data, and API access — pre-configured, compliant, and ready on day one.": "One subscription covers your AI accounts, global mobile data, and API access — pre-configured, compliant, and ready on day one.",
"Get started free →": "Get started free →",
"Open Model Lab →": "Open Model Lab →",
"View pricing": "View pricing",
"+ more": "+ more",
"What's in the package": "What's in the package",
"AI Accounts": "AI Accounts",
"Official access to OpenAI, Claude, Gemini — pre-configured.": "Official access to OpenAI, Claude, Gemini — pre-configured.",
"Annual": "Annual",
"SIM / eSIM": "SIM / eSIM",
"Global data via China Telecom HK. Stable, compliant internet routing — no VPN needed.": "Global data via China Telecom HK. Stable, compliant internet routing — no VPN needed.",
"Flexible": "Flexible",
"API Router": "API Router",
"One API key for all providers. Works with any tool or IDE that supports OpenAI format.": "One API key for all providers. Works with any tool or IDE that supports OpenAI format.",
"Included": "Included",
"Sign up to explore Model Lab free — compare models side by side, then choose a plan.": "Sign up to explore Model Lab free — compare models side by side, then choose a plan.",
"Why Nyquiste": "Why Nyquiste",
"Getting global AI": "Getting global AI",
"used to mean": "used to mean",
"jumping through hoops.": "jumping through hoops.",
"Without Nyquiste": "Without Nyquiste",
"Apply for an overseas email and phone number just to sign up": "Apply for an overseas email and phone number just to sign up",
"Need a foreign credit card — or find someone abroad to pay for you": "Need a foreign credit card — or find someone abroad to pay for you",
"Set up a VPN — and hope it doesn't get blocked mid-session": "Set up a VPN — and hope it doesn't get blocked mid-session",
"Repeat for every provider: ChatGPT, Claude, Gemini separately": "Repeat for every provider: ChatGPT, Claude, Gemini separately",
"With Nyquiste": "With Nyquiste",
"We create and subscribe the accounts for you": "We create and subscribe the accounts for you",
"Receive your OpenAI, Claude, or Gemini login — just sign in and use it.": "Receive your OpenAI, Claude, or Gemini login — just sign in and use it.",
"Pay your way — local or international": "Pay your way — local or international",
"SIM / eSIM for stable, compliant connectivity": "SIM / eSIM for stable, compliant connectivity",
"China Telecom HK routing — reliable access without consumer VPN risk": "China Telecom HK routing — reliable access without consumer VPN risk",
"Nyquiste Router credit included": "Nyquiste Router credit included",
"Use any AI model via base URL + API key — works with Cursor, VS Code, and any OpenAI-compatible tool": "Use any AI model via base URL + API key — works with Cursor, VS Code, and any OpenAI-compatible tool",
"What we support": "What we support",
"The world's leading AI,": "The world's leading AI,",
"ready to use.": "ready to use.",
"We source and manage official subscriptions to the most capable AI models. Choose what you need — or mix and match.": "We source and manage official subscriptions to the most capable AI models. Choose what you need — or mix and match.",
"Flagship": "Flagship",
"Reasoning": "Reasoning",
"Latest": "Latest",
"Image / Video": "Image / Video",
"Most capable": "Most capable",
"Balanced": "Balanced",
"Fast": "Fast",
"Research": "Research",
"The most widely used AI platform — ideal for writing, coding, and multimodal tasks.": "The most widely used AI platform — ideal for writing, coding, and multimodal tasks.",
"Exceptional at nuanced reasoning, long documents, and safety-focused tasks.": "Exceptional at nuanced reasoning, long documents, and safety-focused tasks.",
"Deep integration with Google Search and a 1M-token context window for large-scale research.": "Deep integration with Google Search and a 1M-token context window for large-scale research.",
"Need other providers?": "Need other providers?",
"Contact us →": "Contact us →",
"Model Lab": "Model Lab",
"Compare every model,": "Compare every model,",
"with one prompt.": "with one prompt.",
"Send the same message to GPT-4o, Claude, and Gemini simultaneously. See how each model thinks, writes, and reasons — then decide which fits your workflow.": "Send the same message to GPT-4o, Claude, and Gemini simultaneously. See how each model thinks, writes, and reasons — then decide which fits your workflow.",
"Side-by-side responses in real time": "Side-by-side responses in real time",
"Switch models without retyping your prompt": "Switch models without retyping your prompt",
"Token count and response time for each model": "Token count and response time for each model",
"Try Model Lab →": "Try Model Lab →",
"or view pricing first": "or view pricing first",
"Pricing": "Pricing",
"Simple,": "Simple,",
"transparent": "transparent",
"plans.": "plans.",
"All plans include Nyquiste Router credit and Model Lab access. Billed annually.": "All plans include Nyquiste Router credit and Model Lab access. Billed annually.",
"Description": "Description",
"Price": "Price",
"Billing": "Billing",
"One AI account and connectivity to get started": "One AI account and connectivity to get started",
"All three accounts, SIM data, and full API access": "All three accounts, SIM data, and full API access",
"Other providers, multiple seats, or tailored quotas": "Other providers, multiple seats, or tailored quotas",
"Contact us": "Contact us",
"Annual · 微信 / 支付宝 / Card": "Annual · WeChat Pay / Alipay / Card",
"1 account (choice)": "1 account (your choice)",
"Any provider": "Any provider",
"Add-on available": "Add-on available",
"Custom quota": "Custom quota",
"Standard": "Standard",
"Priority": "Priority",
"Dedicated": "Dedicated",
"Get Pro": "Get Pro",
"Get Ultra": "Get Ultra",
"Custom": "Custom",
"starting today.": "starting today.",
"Create your account, get free credits, and try Model Lab before committing to a plan.": "Create your account, get free credits, and try Model Lab before committing to a plan."
```

- [ ] **Step 3: Run i18n sync to generate stubs for other locales**

```bash
cd web/default && bun run i18n:sync
```
Expected: fr.json, ru.json, ja.json, vi.json updated with stub entries for all new keys.

- [ ] **Step 4: Verify JSON is valid**

```bash
cd web/default && python3 -c "import json; [json.load(open(f'src/i18n/locales/{l}.json')) for l in ['zh','en','fr','ru','ja','vi']]; print('all valid')"
```
Expected: `all valid`

- [ ] **Step 5: Commit**

```bash
git add web/default/src/i18n/locales/
git commit -m "feat(home): add i18n strings for new landing page sections"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Section 1 (Hero + Bundle Manifest) — Task 4
- ✅ Section 2 (Pain vs Solution) — Task 5
- ✅ Section 3 (Model Coverage) — Task 6
- ✅ Section 4 (Model Lab Spotlight) — Task 7
- ✅ Section 5 (Pricing) — Task 8
- ✅ Section 6 (Final CTA) — Task 9
- ✅ Font setup (Plus Jakarta Sans) — Task 1
- ✅ ManifestRow sub-component — Task 2
- ✅ ProviderCard sub-component — Task 3
- ✅ Wire-up (index.ts + index.tsx) — Task 10
- ✅ i18n strings (zh canonical + en + sync stubs) — Task 11
- ✅ isAuthenticated gating (Hero Task 4 + FinalCTA Task 9)
- ✅ Mobile-first layout (flex-col → md:grid-cols in Hero, Pain, Coverage, Lab; overflow-x-auto on table)
- ✅ 44px touch targets (min-h-[44px] on all Button elements)
- ✅ Lora italic on headline second lines (via font-serif + italic classes)
- ✅ AnimateInView scroll animation on all section headers
- ✅ No always-dark overrides — all sections inherit page theme
- ✅ Brand name "Nyquiste" never in t() — used as literal in ProviderCard description strings

**Note:** Old section files (`features.tsx`, `how-it-works.tsx`, `stats.tsx`) are no longer imported after Task 10. They can be deleted in a cleanup commit, but are harmless if left.
