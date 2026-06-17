# Plan Configuration Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, interactive "配置全家桶" (Configure the full bundle) page where a visitor picks a plan tier, sees what's included, toggles optional add-ons, and watches the price update live.

**Architecture:** A new `web/default` feature folder (`features/plan-config/`) holds a typed data layer (`data.ts`), pure pricing logic (`pricing.ts`), and small presentational components. A public TanStack route (`/plan-config`) renders the page inside `PublicLayout`. The home-page "配置全家桶" buttons and a new header button point at it. Visual style matches the home page (`font-landing`, `AnimateInView`, shared `Button`).

**Tech Stack:** React 19 + TypeScript, TanStack Router (file-based, auto-generated route tree), Tailwind CSS v4, Base UI `Button`, `@lobehub/icons` (via `getLobeIcon`), i18next, Bun.

**Testing approach:** This frontend has **no unit-test runner** (no vitest/jest in `package.json`). Per YAGNI we do not add one. Verification for every task is: `bun run typecheck`, `bun run lint`, and live verification in the dev preview (interact, observe). Pure pricing logic is verified against the explicit expected values listed in Task 3. All commands run from `web/default/`.

**Type-checking note:** TanStack Router's `Link to="/plan-config"` is type-checked against the **generated** route tree (`src/routeTree.gen.ts`). The route file (Task 6) must exist and the dev server must have regenerated the tree **before** the header/home links (Tasks 7–8) will typecheck. The plugin regenerates `routeTree.gen.ts` automatically on `bun run dev`. Task order respects this.

---

## File Structure

**Create:**
- `web/default/src/features/plan-config/types.ts` — shared TypeScript types
- `web/default/src/features/plan-config/data.ts` — static config data (providers, data lines, presets, prices)
- `web/default/src/features/plan-config/pricing.ts` — pure `computeTotal` + `matchPreset`
- `web/default/src/features/plan-config/components/addon-row.tsx` — reusable selectable / contact row
- `web/default/src/features/plan-config/components/tier-selector.tsx` — Standard/Pro/Ultra preset cards
- `web/default/src/features/plan-config/components/provider-card.tsx` — provider + included tier + upgrade
- `web/default/src/features/plan-config/components/global-data-list.tsx` — Global Data line list
- `web/default/src/features/plan-config/components/summary-panel.tsx` — sticky itemized summary + Proceed
- `web/default/src/features/plan-config/index.tsx` — `PlanConfig` page (state + layout)
- `web/default/src/routes/plan-config.tsx` — public route definition

**Modify:**
- `web/default/src/i18n/locales/en.json` — add English source keys
- `web/default/src/i18n/locales/zh.json` — add Chinese translations
- `web/default/src/components/layout/components/public-header.tsx` — header button (desktop + mobile)
- `web/default/src/features/home/components/sections/hero.tsx` — repoint button, drop unused prop
- `web/default/src/features/home/components/sections/model-coverage.tsx` — repoint button, drop unused prop
- `web/default/src/features/home/components/sections/support-services.tsx` — repoint button, drop unused prop
- `web/default/src/features/home/index.tsx` — drop the `isAuthenticated` prop on the three updated sections

All new `.tsx`/`.ts` files MUST start with the standard QuantumNous AGPL copyright header (copy verbatim from any existing file in the same folder, e.g. the top 18 lines of `web/default/src/features/cn-us-compare/index.tsx`). This is required by project Rule 5 — do not omit or alter it.

---

## Task 1: i18n keys

**Files:**
- Modify: `web/default/src/i18n/locales/en.json`
- Modify: `web/default/src/i18n/locales/zh.json`

- [ ] **Step 1: Add English keys to `en.json`**

Inside the top-level `"translation": { ... }` object, add these key/value pairs (value = key for English). Keep alphabetical-ish placement loose; JSON order doesn't matter. Skip any key that already exists (`"Configure the full bundle"`, `"Contact us"`, `"Contact us →"` already exist — leave them).

```json
"Configure your AI bundle": "Configure your AI bundle",
"Pick a starting tier, then tailor it. Your price updates live.": "Pick a starting tier, then tailor it. Your price updates live.",
"Base bundle": "Base bundle",
"+ HK Global Data": "+ HK Global Data",
"+ US Global Data": "+ US Global Data",
"Included in every plan": "Included in every plan",
"AI providers & subscriptions": "AI providers & subscriptions",
"What you get": "What you get",
"Plan details synced from official site": "Plan details synced from official site",
"Upgrade to {{plan}}": "Upgrade to {{plan}}",
"Global Data": "Global Data",
"50 GB · SIM / eSIM · add one or more lines": "50 GB · SIM / eSIM · add one or more lines",
"China Mobile (HK)": "China Mobile (HK)",
"China Telecom (HK)": "China Telecom (HK)",
"US Mobile (US)": "US Mobile (US)",
"Need more Global Data?": "Need more Global Data?",
"Apple ID": "Apple ID",
"US region Apple ID": "US region Apple ID",
"More options": "More options",
"Need more AI providers?": "Need more AI providers?",
"Need an overseas phone?": "Need an overseas phone?",
"Your configuration": "Your configuration",
"Total": "Total",
"Proceed": "Proceed",
"This is a preview — checkout isn't available yet.": "This is a preview — checkout isn't available yet."
```

- [ ] **Step 2: Add Chinese translations to `zh.json`**

Inside `"translation": { ... }`, add the same keys with Chinese values. If a key already exists in `zh.json`, leave the existing value.

```json
"Configure your AI bundle": "配置你的 AI 全家桶",
"Pick a starting tier, then tailor it. Your price updates live.": "选择一个起始套餐，再按需定制，价格实时更新。",
"Base bundle": "基础套餐",
"+ HK Global Data": "+ 香港全球流量",
"+ US Global Data": "+ 美国全球流量",
"Included in every plan": "每个套餐均包含",
"AI providers & subscriptions": "AI 服务商与订阅",
"What you get": "包含内容",
"Plan details synced from official site": "套餐详情同步自官方网站",
"Upgrade to {{plan}}": "升级到 {{plan}}",
"Global Data": "全球流量",
"50 GB · SIM / eSIM · add one or more lines": "50 GB · SIM / eSIM · 可添加一条或多条线路",
"China Mobile (HK)": "中国移动（HK）",
"China Telecom (HK)": "中国电信（HK）",
"US Mobile (US)": "US Mobile（US）",
"Need more Global Data?": "需要更多流量？",
"Apple ID": "Apple ID",
"US region Apple ID": "美区 Apple ID",
"More options": "更多选项",
"Need more AI providers?": "需要更多 AI 服务商？",
"Need an overseas phone?": "需要外版手机？",
"Your configuration": "你的配置",
"Total": "总计",
"Proceed": "继续",
"This is a preview — checkout isn't available yet.": "这是预览页面，暂未开放结算。"
```

- [ ] **Step 3: Sync locales**

Run: `bun run i18n:sync`
Expected: command completes; fr/ru/ja/vi locale files gain the new keys (as English placeholders). No error.

- [ ] **Step 4: Verify JSON validity**

Run: `bun run typecheck`
Expected: PASS (no JSON parse errors surfaced; note new keys aren't referenced yet).

- [ ] **Step 5: Commit**

```bash
git add web/default/src/i18n/locales
git commit -m "i18n: add plan configuration page strings"
```

---

## Task 2: Data layer — types & static data

**Files:**
- Create: `web/default/src/features/plan-config/types.ts`
- Create: `web/default/src/features/plan-config/data.ts`

- [ ] **Step 1: Create `types.ts`**

(Prepend the AGPL copyright header.)

```ts
export type TierId = 'standard' | 'pro' | 'ultra'
export type ProviderId = 'openai' | 'anthropic' | 'google'
export type DataLineId = 'cmcc-hk' | 'ct-hk' | 'us-mobile'

/** Current user selection. Base bundle is always included and not represented here. */
export interface Selection {
  upgrades: ProviderId[]
  dataLines: DataLineId[]
  appleId: boolean
}

/** features[] is intentionally empty for now — reserved for live-synced plan details. */
export interface SubscriptionTier {
  /** Literal product name, e.g. "ChatGPT Plus". Not translated. */
  productName: string
  features: string[]
}

export interface ProviderConfig {
  id: ProviderId
  /** Literal brand name. Not translated. */
  name: string
  /** lobe icon name passed to getLobeIcon, e.g. "OpenAI.Color". */
  icon: string
  included: SubscriptionTier
  upgrade: {
    /** Literal product name, e.g. "ChatGPT Pro". Rendered via t('Upgrade to {{plan}}'). */
    productName: string
    price: number
    features: string[]
  }
}

export interface DataLineConfig {
  id: DataLineId
  /** i18n key, e.g. "China Telecom (HK)". */
  labelKey: string
  price: number
}

export interface PresetConfig {
  id: TierId
  /** Literal tier name: Standard / Pro / Ultra. */
  name: string
  /** i18n key for the short descriptor under the name. */
  descKey: string
  /** Display price shown on the preset card. */
  price: number
  upgrades: ProviderId[]
  dataLines: DataLineId[]
}
```

- [ ] **Step 2: Create `data.ts`**

(Prepend the AGPL copyright header.)

```ts
import type {
  DataLineConfig,
  PresetConfig,
  ProviderConfig,
} from './types'

export const BASE_PRICE = 6666

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'OpenAI.Color',
    included: { productName: 'ChatGPT Plus', features: [] },
    upgrade: { productName: 'ChatGPT Pro', price: 8888, features: [] },
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'Claude.Color',
    included: { productName: 'Claude Pro', features: [] },
    upgrade: { productName: 'Claude Max', price: 8888, features: [] },
  },
  {
    id: 'google',
    name: 'Google',
    icon: 'Gemini.Color',
    included: { productName: 'Google AI Pro', features: [] },
    upgrade: { productName: 'Google AI Ultra', price: 8888, features: [] },
  },
]

export const GLOBAL_DATA_LINES: DataLineConfig[] = [
  { id: 'cmcc-hk', labelKey: 'China Mobile (HK)', price: 2222 },
  { id: 'ct-hk', labelKey: 'China Telecom (HK)', price: 2222 },
  { id: 'us-mobile', labelKey: 'US Mobile (US)', price: 3333 },
]

export const APPLE_ID = { labelKey: 'US region Apple ID', price: 120 }

/** Contact-only items: no price, disabled placeholder CTA. */
export const CONTACT_ITEMS: { id: string; labelKey: string }[] = [
  { id: 'more-providers', labelKey: 'Need more AI providers?' },
  { id: 'overseas-phone', labelKey: 'Need an overseas phone?' },
]

export const PRESETS: PresetConfig[] = [
  { id: 'standard', name: 'Standard', descKey: 'Base bundle', price: 6666, upgrades: [], dataLines: [] },
  { id: 'pro', name: 'Pro', descKey: '+ HK Global Data', price: 8888, upgrades: [], dataLines: ['ct-hk'] },
  { id: 'ultra', name: 'Ultra', descKey: '+ US Global Data', price: 9999, upgrades: [], dataLines: ['us-mobile'] },
]
```

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add web/default/src/features/plan-config/types.ts web/default/src/features/plan-config/data.ts
git commit -m "feat(plan-config): add data layer types and static config"
```

---

## Task 3: Pure pricing logic

**Files:**
- Create: `web/default/src/features/plan-config/pricing.ts`

Expected pricing (this is the verification spec — confirm these by interacting with the page in Task 9):
- `{ upgrades: [], dataLines: [], appleId: false }` → **6666** (Standard)
- `{ upgrades: [], dataLines: ['ct-hk'], appleId: false }` → **8888** (Pro)
- `{ upgrades: [], dataLines: ['us-mobile'], appleId: false }` → **9999** (Ultra)
- `{ upgrades: ['openai'], dataLines: ['ct-hk'], appleId: false }` → **17776**
- `{ upgrades: ['openai','anthropic','google'], dataLines: ['cmcc-hk','ct-hk','us-mobile'], appleId: true }` → 6666 + 26664 + 7777 + 120 = **41227**

`matchPreset` returns a tier id only when upgrades empty, appleId false, and the dataLines set equals exactly one preset's dataLines:
- `[]` → `'standard'`; `['ct-hk']` → `'pro'`; `['us-mobile']` → `'ultra'`; `['cmcc-hk']` → `null`; any upgrade or appleId → `null`.

- [ ] **Step 1: Create `pricing.ts`**

(Prepend the AGPL copyright header.)

```ts
import { APPLE_ID, BASE_PRICE, GLOBAL_DATA_LINES, PRESETS, PROVIDERS } from './data'
import type { Selection, TierId } from './types'

export function computeTotal(selection: Selection): number {
  let total = BASE_PRICE
  for (const id of selection.upgrades) {
    const provider = PROVIDERS.find((p) => p.id === id)
    if (provider) total += provider.upgrade.price
  }
  for (const id of selection.dataLines) {
    const line = GLOBAL_DATA_LINES.find((l) => l.id === id)
    if (line) total += line.price
  }
  if (selection.appleId) total += APPLE_ID.price
  return total
}

function sameDataLines(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((id) => set.has(id))
}

/** Returns the preset whose add-ons exactly match the selection, else null (custom). */
export function matchPreset(selection: Selection): TierId | null {
  if (selection.upgrades.length > 0 || selection.appleId) return null
  const preset = PRESETS.find(
    (p) => p.upgrades.length === 0 && sameDataLines(p.dataLines, selection.dataLines)
  )
  return preset ? preset.id : null
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add web/default/src/features/plan-config/pricing.ts
git commit -m "feat(plan-config): add pure pricing and preset-match logic"
```

---

## Task 4: Presentational components — AddonRow & TierSelector

**Files:**
- Create: `web/default/src/features/plan-config/components/addon-row.tsx`
- Create: `web/default/src/features/plan-config/components/tier-selector.tsx`

- [ ] **Step 1: Create `addon-row.tsx`**

(Prepend the AGPL copyright header.) A reusable row: selectable (checkbox + price) or a disabled contact row (dashed, "Contact us →").

```tsx
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface AddonRowProps {
  label: React.ReactNode
  /** Show "+¥price"; omit for contact rows. */
  price?: number
  selected?: boolean
  /** Renders a non-interactive "Contact us →" placeholder row. */
  contact?: boolean
  onToggle?: () => void
}

export function AddonRow({ label, price, selected, contact, onToggle }: AddonRowProps) {
  const { t } = useTranslation()

  if (contact) {
    return (
      <div className='font-landing flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-xl border border-dashed border-border/50 px-4 py-3 text-sm text-muted-foreground'>
        <span className='font-medium'>{label}</span>
        <span className='text-xs'>{t('Contact us →')}</span>
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'font-landing flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
        selected
          ? 'border-foreground bg-muted/20 ring-1 ring-foreground'
          : 'border-border/60 hover:bg-muted/30'
      )}
    >
      <span className='flex items-center gap-2.5 font-medium text-foreground'>
        <span
          className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
            selected ? 'border-foreground bg-foreground text-background' : 'border-border'
          )}
        >
          {selected && <Check className='size-3' />}
        </span>
        {label}
      </span>
      {price != null && (
        <span className='font-mono text-sm font-semibold tabular-nums text-foreground'>
          +¥{price.toLocaleString()}
        </span>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Create `tier-selector.tsx`**

(Prepend the AGPL copyright header.)

```tsx
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { PRESETS } from '../data'
import type { TierId } from '../types'

interface TierSelectorProps {
  activeTier: TierId | null
  onSelect: (id: TierId) => void
}

export function TierSelector({ activeTier, onSelect }: TierSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      {PRESETS.map((preset) => {
        const isActive = activeTier === preset.id
        return (
          <button
            key={preset.id}
            type='button'
            onClick={() => onSelect(preset.id)}
            aria-pressed={isActive}
            className={cn(
              'font-landing flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-4 py-5 text-center transition-colors',
              isActive
                ? 'border-foreground bg-muted/20 ring-1 ring-foreground'
                : 'border-border/60 hover:bg-muted/30'
            )}
          >
            <span className='text-xs font-medium text-muted-foreground'>
              {t(preset.descKey)}
            </span>
            <span className='text-lg font-bold tracking-tight text-foreground'>
              {preset.name}
            </span>
            <span className='font-mono text-base font-semibold tabular-nums text-foreground'>
              ¥{preset.price.toLocaleString()}
            </span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Typecheck & lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add web/default/src/features/plan-config/components/addon-row.tsx web/default/src/features/plan-config/components/tier-selector.tsx
git commit -m "feat(plan-config): add AddonRow and TierSelector components"
```

---

## Task 5: Presentational components — ProviderCard, GlobalDataList, SummaryPanel

**Files:**
- Create: `web/default/src/features/plan-config/components/provider-card.tsx`
- Create: `web/default/src/features/plan-config/components/global-data-list.tsx`
- Create: `web/default/src/features/plan-config/components/summary-panel.tsx`

- [ ] **Step 1: Create `provider-card.tsx`**

(Prepend the AGPL copyright header.) Shows logo, name, included badge, fixed-height "What you get" placeholder block (because `features` is empty), and an upgrade toggle.

```tsx
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import type { ProviderConfig } from '../types'

interface ProviderCardProps {
  provider: ProviderConfig
  upgraded: boolean
  onToggleUpgrade: () => void
}

export function ProviderCard({ provider, upgraded, onToggleUpgrade }: ProviderCardProps) {
  const { t } = useTranslation()
  const features = upgraded ? provider.upgrade.features : provider.included.features

  return (
    <div className='font-landing flex flex-col gap-3 rounded-2xl border border-border/60 p-5'>
      <div className='flex items-center gap-2.5'>
        <span className='flex size-8 shrink-0 items-center justify-center'>
          {getLobeIcon(provider.icon, 28)}
        </span>
        <span className='text-sm font-semibold text-foreground'>{provider.name}</span>
      </div>

      <span className='inline-flex w-max items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-foreground'>
        <Check className='size-3' />
        {provider.included.productName}
      </span>

      <div className='min-h-[72px]'>
        <p className='mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
          {t('What you get')}
        </p>
        {features.length > 0 ? (
          <ul className='space-y-1 text-xs text-muted-foreground'>
            {features.map((f) => (
              <li key={f} className='flex items-start gap-1.5'>
                <span aria-hidden>·</span>
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <div className='space-y-2'>
            <div className='h-2 w-full rounded bg-muted/60' />
            <div className='h-2 w-3/4 rounded bg-muted/60' />
            <p className='text-[10px] text-muted-foreground/70 italic'>
              {t('Plan details synced from official site')}
            </p>
          </div>
        )}
      </div>

      <button
        type='button'
        onClick={onToggleUpgrade}
        aria-pressed={upgraded}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition-colors',
          upgraded
            ? 'border-foreground bg-muted/20 ring-1 ring-foreground'
            : 'border-dashed border-border/60 hover:bg-muted/30'
        )}
      >
        <span className='font-medium text-foreground'>
          ↑ {t('Upgrade to {{plan}}', { plan: provider.upgrade.productName })}
        </span>
        <span className='font-mono font-semibold tabular-nums text-foreground'>
          +¥{provider.upgrade.price.toLocaleString()}
        </span>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create `global-data-list.tsx`**

(Prepend the AGPL copyright header.)

```tsx
import { useTranslation } from 'react-i18next'
import { GLOBAL_DATA_LINES } from '../data'
import type { DataLineId } from '../types'
import { AddonRow } from './addon-row'

interface GlobalDataListProps {
  selected: DataLineId[]
  onToggle: (id: DataLineId) => void
}

export function GlobalDataList({ selected, onToggle }: GlobalDataListProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-2.5'>
      {GLOBAL_DATA_LINES.map((line) => (
        <AddonRow
          key={line.id}
          label={t(line.labelKey)}
          price={line.price}
          selected={selected.includes(line.id)}
          onToggle={() => onToggle(line.id)}
        />
      ))}
      <AddonRow label={t('Need more Global Data?')} contact />
    </div>
  )
}
```

- [ ] **Step 3: Create `summary-panel.tsx`**

(Prepend the AGPL copyright header.) Builds line items from the selection and renders the placeholder Proceed button (no `onClick`).

```tsx
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { APPLE_ID, BASE_PRICE, GLOBAL_DATA_LINES, PROVIDERS } from '../data'
import type { Selection } from '../types'

interface SummaryPanelProps {
  selection: Selection
  total: number
}

export function SummaryPanel({ selection, total }: SummaryPanelProps) {
  const { t } = useTranslation()

  const upgradeLines = PROVIDERS.filter((p) => selection.upgrades.includes(p.id))
  const dataLines = GLOBAL_DATA_LINES.filter((l) => selection.dataLines.includes(l.id))

  return (
    <div className='font-landing rounded-2xl border border-border/60 p-5 lg:sticky lg:top-24'>
      <p className='mb-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
        {t('Your configuration')}
      </p>

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between gap-3'>
          <span className='text-foreground'>{t('Base bundle')}</span>
          <span className='font-mono tabular-nums text-foreground'>¥{BASE_PRICE.toLocaleString()}</span>
        </div>
        <p className='text-xs text-muted-foreground'>ChatGPT Plus · Claude Pro · Google AI Pro</p>

        {upgradeLines.map((p) => (
          <div key={p.id} className='flex items-center justify-between gap-3 border-t border-border/30 pt-2'>
            <span className='text-foreground'>{t('Upgrade to {{plan}}', { plan: p.upgrade.productName })}</span>
            <span className='font-mono tabular-nums text-foreground'>¥{p.upgrade.price.toLocaleString()}</span>
          </div>
        ))}

        {dataLines.map((l) => (
          <div key={l.id} className='flex items-center justify-between gap-3 border-t border-border/30 pt-2'>
            <span className='text-foreground'>{t('Global Data')} · {t(l.labelKey)}</span>
            <span className='font-mono tabular-nums text-foreground'>¥{l.price.toLocaleString()}</span>
          </div>
        ))}

        {selection.appleId && (
          <div className='flex items-center justify-between gap-3 border-t border-border/30 pt-2'>
            <span className='text-foreground'>{t('US region Apple ID')}</span>
            <span className='font-mono tabular-nums text-foreground'>¥{APPLE_ID.price.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className='mt-4 flex items-center justify-between border-t-2 border-border/50 pt-3'>
        <span className='text-base font-bold text-foreground'>{t('Total')}</span>
        <span className='font-mono text-xl font-extrabold tabular-nums text-foreground'>
          ¥{total.toLocaleString()}
        </span>
      </div>

      <Button type='button' className='mt-4 min-h-[48px] w-full rounded-lg text-sm'>
        {t('Proceed')}
      </Button>
      <p className='mt-2 text-center text-[10px] text-muted-foreground'>
        {t("This is a preview — checkout isn't available yet.")}
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck & lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/default/src/features/plan-config/components
git commit -m "feat(plan-config): add ProviderCard, GlobalDataList, SummaryPanel"
```

---

## Task 6: Page composition + route

**Files:**
- Create: `web/default/src/features/plan-config/index.tsx`
- Create: `web/default/src/routes/plan-config.tsx`

- [ ] **Step 1: Create `index.tsx`**

(Prepend the AGPL copyright header.) Holds state, applies presets, toggles add-ons, lays out the page in home-page style.

```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'
import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import { APPLE_ID, CONTACT_ITEMS, PRESETS, PROVIDERS } from './data'
import { computeTotal, matchPreset } from './pricing'
import type { DataLineId, ProviderId, Selection, TierId } from './types'
import { AddonRow } from './components/addon-row'
import { GlobalDataList } from './components/global-data-list'
import { ProviderCard } from './components/provider-card'
import { SummaryPanel } from './components/summary-panel'
import { TierSelector } from './components/tier-selector'

const INITIAL: Selection = { upgrades: [], dataLines: ['ct-hk'], appleId: false }

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function PlanConfig() {
  const { t } = useTranslation()
  const [selection, setSelection] = useState<Selection>(INITIAL)

  const total = computeTotal(selection)
  const activeTier = matchPreset(selection)

  const applyPreset = (id: TierId) => {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) return
    setSelection({ upgrades: [...preset.upgrades], dataLines: [...preset.dataLines], appleId: false })
  }

  const toggleUpgrade = (id: ProviderId) =>
    setSelection((s) => ({ ...s, upgrades: toggle(s.upgrades, id) }))
  const toggleDataLine = (id: DataLineId) =>
    setSelection((s) => ({ ...s, dataLines: toggle(s.dataLines, id) }))
  const toggleAppleId = () => setSelection((s) => ({ ...s, appleId: !s.appleId }))

  return (
    <PublicLayout showMainContainer={false}>
      <main className='font-landing min-w-0 overflow-x-hidden'>
        <div className='mx-auto w-full max-w-6xl px-6 py-16 md:py-20'>
          <AnimateInView className='mx-auto mb-10 max-w-2xl text-center'>
            <h1 className='text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-tight text-foreground'>
              {t('Configure your AI bundle')}
            </h1>
            <p className='mt-3 text-sm text-muted-foreground'>
              {t('Pick a starting tier, then tailor it. Your price updates live.')}
            </p>
          </AnimateInView>

          <AnimateInView className='mb-10' delay={80}>
            <TierSelector activeTier={activeTier} onSelect={applyPreset} />
          </AnimateInView>

          <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start'>
            <div className='space-y-8'>
              <AnimateInView animation='fade-up' delay={120}>
                <p className='mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                  ✓ {t('Included in every plan')}
                </p>
                <p className='mb-4 text-sm text-muted-foreground'>{t('AI providers & subscriptions')}</p>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {PROVIDERS.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      upgraded={selection.upgrades.includes(provider.id)}
                      onToggleUpgrade={() => toggleUpgrade(provider.id)}
                    />
                  ))}
                </div>
              </AnimateInView>

              <AnimateInView animation='fade-up' delay={160}>
                <p className='mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                  {t('Global Data')}
                </p>
                <p className='mb-4 text-sm text-muted-foreground'>
                  {t('50 GB · SIM / eSIM · add one or more lines')}
                </p>
                <GlobalDataList selected={selection.dataLines} onToggle={toggleDataLine} />
              </AnimateInView>

              <div className='grid gap-6 sm:grid-cols-2'>
                <AnimateInView animation='fade-up' delay={200}>
                  <p className='mb-4 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                    {t('Apple ID')}
                  </p>
                  <AddonRow
                    label={t('US region Apple ID')}
                    price={APPLE_ID.price}
                    selected={selection.appleId}
                    onToggle={toggleAppleId}
                  />
                </AnimateInView>

                <AnimateInView animation='fade-up' delay={220}>
                  <p className='mb-4 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                    {t('More options')}
                  </p>
                  <div className='space-y-2.5'>
                    {CONTACT_ITEMS.map((item) => (
                      <AddonRow key={item.id} label={t(item.labelKey)} contact />
                    ))}
                  </div>
                </AnimateInView>
              </div>
            </div>

            <AnimateInView animation='fade-up' delay={140}>
              <SummaryPanel selection={selection} total={total} />
            </AnimateInView>
          </div>
        </div>
        <Footer
          compactBar
          compactBarCopyright={t('© 2023 - 2026 Nyquiste Corporation. All rights reserved.')}
        />
      </main>
    </PublicLayout>
  )
}
```

- [ ] **Step 2: Create the route `plan-config.tsx`**

(Prepend the AGPL copyright header.) Mirror `routes/cn-us-compare.tsx`.

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { PlanConfig } from '@/features/plan-config'

export const Route = createFileRoute('/plan-config')({
  component: PlanConfig,
})
```

- [ ] **Step 3: Start the dev preview to regenerate the route tree**

Use the preview tooling to start the dev server (this runs `bun run dev`, which makes the TanStack Router plugin regenerate `src/routeTree.gen.ts` to include `/plan-config`). Then navigate to `/plan-config`.
Expected: `src/routeTree.gen.ts` now contains a `PlanConfigRoute` entry (`grep -n "plan-config" web/default/src/routeTree.gen.ts` returns matches).

- [ ] **Step 4: Verify the page renders**

In the preview, load `/plan-config`.
Expected: page shows the title, three tier cards (Pro highlighted by default since initial selection is `['ct-hk']`), three provider cards with included badges + placeholder "What you get", Global Data rows (China Telecom HK selected), Apple ID + More options, and the sticky summary showing **¥8888** total.

- [ ] **Step 5: Typecheck, lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/default/src/features/plan-config/index.tsx web/default/src/routes/plan-config.tsx web/default/src/routeTree.gen.ts
git commit -m "feat(plan-config): add page composition and public route"
```

---

## Task 7: Header button

**Files:**
- Modify: `web/default/src/components/layout/components/public-header.tsx`

- [ ] **Step 1: Add the desktop header button**

In the desktop nav block, the auth section starts at the `{showAuthButtons && (` group (around line 299). Insert a `配置全家桶` button just before that group, after the notifications block. Add this block immediately before the line `{showAuthButtons && (`:

```tsx
              <div className='bg-border/40 mx-1 h-4 w-px' />
              <Button
                size='sm'
                variant='outline'
                className='h-8 rounded-lg px-3.5 text-xs font-medium'
                render={<Link to='/plan-config' />}
              >
                {t('Configure the full bundle')}
              </Button>

```

(`Button`, `Link`, and `t` are already imported in this file.)

- [ ] **Step 2: Add the mobile overlay button**

In the mobile overlay CTA section (the `flex flex-col gap-3` block near line 415, inside it the `{showAuthButtons && (` link). Insert this `配置全家桶` link as the first child of that `flex flex-col gap-3` container, before the existing `{showAuthButtons && (` block:

```tsx
            <Link
              to='/plan-config'
              onClick={() => setMobileOpen(false)}
              className='border-border/70 text-foreground inline-flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-muted/40'
            >
              {t('Configure the full bundle')}
            </Link>
```

- [ ] **Step 3: Typecheck, lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS (the `/plan-config` route now exists in the generated tree from Task 6).

- [ ] **Step 4: Verify in preview**

Reload any public page. Confirm the `配置全家桶` button appears in the desktop header and navigates to `/plan-config`. Open the mobile overlay (resize narrow) and confirm the button appears there too and navigates.

- [ ] **Step 5: Commit**

```bash
git add web/default/src/components/layout/components/public-header.tsx
git commit -m "feat(plan-config): add Configure the full bundle button to public header"
```

---

## Task 8: Repoint home-page buttons

**Files:**
- Modify: `web/default/src/features/home/components/sections/hero.tsx`
- Modify: `web/default/src/features/home/components/sections/model-coverage.tsx`
- Modify: `web/default/src/features/home/components/sections/support-services.tsx`
- Modify: `web/default/src/features/home/index.tsx`

- [ ] **Step 1: Update `hero.tsx`**

Change the button target (line ~93) from:

```tsx
              render={<Link to={isAuthenticated ? '/dashboard' : '/sign-up'} />}
```

to:

```tsx
              render={<Link to='/plan-config' />}
```

Then remove the now-unused prop. Change the interface (lines 23-25) and signature (line 27):

```tsx
export function Hero() {
```

Delete the `interface HeroProps { isAuthenticated?: boolean }` block entirely.

- [ ] **Step 2: Update `model-coverage.tsx`**

Change the button target (line ~94) to `render={<Link to='/plan-config' />}`. Remove `isAuthenticated` from the signature and delete the `ModelCoverageProps` interface block (lines 25-27). Verify no other usage of `isAuthenticated` remains in the file via `grep -n isAuthenticated web/default/src/features/home/components/sections/model-coverage.tsx` (should return nothing after edit).

- [ ] **Step 3: Update `support-services.tsx`**

Change the button target (line ~91) to `render={<Link to='/plan-config' />}`. Remove `isAuthenticated` from the signature and delete the `SupportServicesProps` interface block (lines 25-27). Verify with `grep -n isAuthenticated web/default/src/features/home/components/sections/support-services.tsx` (should return nothing).

- [ ] **Step 4: Update `home/index.tsx` call sites**

The three sections no longer accept `isAuthenticated`. Change lines 67, 69, 70 from:

```tsx
      <Hero isAuthenticated={isAuthenticated} />
      <PainVsSolution />
      <ModelCoverage isAuthenticated={isAuthenticated} />
      <SupportServices isAuthenticated={isAuthenticated} />
      <ModelLabSpotlight isAuthenticated={isAuthenticated} />
```

to:

```tsx
      <Hero />
      <PainVsSolution />
      <ModelCoverage />
      <SupportServices />
      <ModelLabSpotlight isAuthenticated={isAuthenticated} />
```

(Leave `ModelLabSpotlight` unchanged — it still uses the prop. The `isAuthenticated` const stays since `ModelLabSpotlight` consumes it.)

- [ ] **Step 5: Typecheck, lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS. No "unused variable" errors for `isAuthenticated`.

- [ ] **Step 6: Verify in preview**

Load the home page. Click each "配置全家桶" button (hero, model coverage, support services) and confirm each navigates to `/plan-config`.

- [ ] **Step 7: Commit**

```bash
git add web/default/src/features/home
git commit -m "feat(plan-config): point home Configure buttons to /plan-config"
```

---

## Task 9: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full static checks**

Run: `bun run typecheck && bun run lint && bun run knip`
Expected: typecheck PASS, lint PASS. For `knip`: confirm it reports no NEW unused exports/files for `features/plan-config` (pre-existing knip warnings elsewhere are out of scope).

- [ ] **Step 2: Verify pricing interactively**

In the preview on `/plan-config`, reproduce the Task 3 expected values and confirm the summary Total matches:
- Click **Standard** → Total **¥6666**.
- Click **Pro** → Total **¥8888**, China Telecom (HK) row selected.
- Click **Ultra** → Total **¥9999**, US Mobile (US) row selected.
- From Standard, toggle **Upgrade to ChatGPT Pro** + **China Telecom (HK)** → Total **¥17776**.
- Select all 3 upgrades + all 3 data lines + Apple ID → Total **¥41227**.
- Confirm that after a manual toggle that doesn't match a preset (e.g. select only `China Mobile (HK)`), no tier card is highlighted.

- [ ] **Step 3: Verify styling & i18n**

- Confirm the page visually matches home styling (fonts, spacing, reveal animations on scroll).
- Switch language to 中文 via the header language switcher; confirm labels translate (配置你的 AI 全家桶, 全球流量, 中国电信（HK）, 美区 Apple ID, 总计, 继续, etc.) and provider/product names stay literal (OpenAI, ChatGPT Plus, Claude Max…).
- Confirm the **Proceed** button and the **Contact us** rows do nothing on click.

- [ ] **Step 4: Responsive check**

Resize to mobile width. Confirm: tier cards stack, provider cards reflow to one column, the summary drops below the configuration (no longer sticky), and the header `配置全家桶` button is reachable via the mobile overlay.

- [ ] **Step 5: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "fix(plan-config): verification fixes"
```

(Skip if Steps 1–4 required no changes.)

---

## Self-Review Notes (for the planner — not an execution step)

- **Spec coverage:** public route ✓ (T6), `PublicLayout` ✓ (T6), header button ✓ (T7), home buttons repointed ✓ (T8), preset+add-ons model ✓ (T6), Standard floor / base always included ✓ (data + pricing T2/T3), Global Data multi-select ✓ (T5), upgrades additive +¥8888 ✓ (T2/T3), Apple ID toggle ✓ (T6), contact items disabled ✓ (T5/T6), provider-card placeholder `features[]` ✓ (T5), Pro→中国电信(HK) default ✓ (data T2 + INITIAL T6), Ultra→US Mobile ✓, full i18n ✓ (T1), Proceed placeholder ✓ (T5), AGPL headers / Rule 5 ✓ (noted per file).
- **Type consistency:** `Selection`, `ProviderConfig`, `DataLineConfig`, `PresetConfig` defined in T2 and used unchanged in T3–T6. `computeTotal` / `matchPreset` signatures consistent. `getLobeIcon(name, size)` matches `lib/lobe-icon.tsx`. `Button render={<Link/>}` matches existing home usage.
- **No placeholders:** every code step contains complete code; verification uses real commands and concrete expected numbers.
