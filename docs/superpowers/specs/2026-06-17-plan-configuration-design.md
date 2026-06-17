# Plan Configuration Page — Design Spec

**Date:** 2026-06-17
**Status:** Approved (brainstorm) → ready for implementation plan
**Scope:** New public, interactive "配置全家桶" (Configure the full bundle) page for the `web/default` frontend.

---

## 1. Goal

A public (no auth) interactive page where a visitor picks a plan tier, sees exactly
what is included, configures optional add-ons, and watches the price update live.
It is the redirect target for every "配置全家桶" button on the site, and gets its own
header button. A final **Proceed** button is a visual placeholder with no action yet.

The "what's included" presentation must be clearer than the source comparison table:
included items read as an explicit spec sheet, not as "Same as Standard" cells.

**Visual style must match the home page**: `font-landing` typography, `AnimateInView`
reveal animations, the shared `Button` component, and the same border/spacing rhythm
(`border-border/50`, rounded panels, `max-w` containers, muted-foreground secondary text).

---

## 2. Pricing model (from the source image)

Base bundle (**Standard**, the floor — always included, cannot be removed):

- AI providers: **OpenAI + Anthropic + Google**
- Annual subscriptions: **ChatGPT Plus + Claude Pro + Google AI Pro**
- Price: **¥6666**

Add-ons stack on top of the base:

| Add-on | Price | Select |
| --- | --- | --- |
| Upgrade → ChatGPT Pro | +¥8888 | multi (per provider) |
| Upgrade → Claude Max | +¥8888 | multi |
| Upgrade → Google AI Ultra | +¥8888 | multi |
| Global Data · 中国移动 (HK) · 50GB SIM/eSIM | +¥2222 | multi (lines) |
| Global Data · 中国电信 (HK) · 50GB SIM/eSIM | +¥2222 | multi |
| Global Data · US Mobile (US) · 50GB SIM/eSIM | +¥3333 | multi |
| Apple ID · US region | +¥120 | toggle |

Contact-only items (no price, disabled placeholder CTA): **more AI providers**,
**more Global Data**, **overseas phone (外版手机)**.

Tier presets are the same base + a preset set of add-ons:

- **Standard ¥6666** = base only (no Global Data)
- **Pro ¥8888** = base + 中国电信 (HK) Global Data line (`¥6666 + ¥2222`)
- **Ultra ¥9999** = base + US Mobile (US) Global Data line (`¥6666 + ¥3333`)

`total = BASE_PRICE + Σ upgrades + Σ globalDataLines + (appleId ? 120 : 0)`

---

## 3. Routing & placement

- **Route:** new public route `web/default/src/routes/plan-config.tsx` → renders
  `PlanConfig` from the feature folder. Pattern mirrors `routes/cn-us-compare.tsx`
  (`createFileRoute('/plan-config')`). The component wraps its content in `PublicLayout`.
- **Feature folder:** `web/default/src/features/plan-config/`
  - `index.tsx` — page composition + state
  - `types.ts` — TypeScript types
  - `data.ts` — static config data (prices, providers, presets) with i18n label keys
  - `components/` — `tier-selector.tsx`, `provider-card.tsx`, `global-data-list.tsx`,
    `addon-row.tsx`, `summary-panel.tsx` (split so each unit is focused/testable)
- **Header button:** add a prominent `配置全家桶` button to `PublicHeader`
  (`components/layout/components/public-header.tsx`) in both the desktop action area
  and the mobile overlay, linking to `/plan-config`.
- **Home buttons repointed:** change `to={isAuthenticated ? '/dashboard' : '/sign-up'}`
  → `to='/plan-config'` in:
  - `features/home/components/sections/hero.tsx:93`
  - `features/home/components/sections/model-coverage.tsx:94`
  - `features/home/components/sections/support-services.tsx:91`
  (The `isAuthenticated` prop may become unused in some sections — clean up accordingly.)

---

## 4. Page layout (refined Layout A)

Single `PublicLayout` page, home-page styling. Top to bottom:

1. **Heading + intro** — title (`配置全家桶`) and one-line subtitle, centered, `font-landing`.
2. **Tier presets** — full-width row of three cards (Standard / Pro / Ultra), each
   showing name, short descriptor, and price. Clicking one **quick-applies** that
   preset's add-on defaults. A preset is highlighted when the current selection matches
   it; otherwise none is highlighted (selection is "custom"). Base is always included —
   presets never remove it.
3. **Two-column body** (`lg:grid-cols-[minmax(0,1fr)_320px]`, stacks on mobile):
   - **Left (wide) — configuration:**
     - **Core bundle panel** — labeled "✓ Included in every plan". Three rich
       **provider cards**: logo (`@lobehub/icons`), provider name, an `✓ <tier>`
       included badge, a **"What you get"** detail block, and an inline **upgrade**
       control (`↑ Upgrade to … +¥8888`, toggleable).
     - **Global Data panel** — "50 GB · SIM/eSIM", multi-select line rows, plus a
       disabled "Need more data? Contact us" row.
     - **Apple ID + More options** — Apple ID toggle (+¥120); More options panel with
       disabled "Contact us" rows (more providers, overseas phone).
   - **Right (sticky) — summary:** itemized list (base + each selected add-on with
     price), live **total**, and the placeholder **Proceed** button. Sticky on desktop;
     on mobile it falls to the bottom of the flow (a sticky bottom total bar is a
     nice-to-have, not required for v1).

### Provider card "What you get" placeholder

Each `includedTier` and `upgrade` carries a `features: string[]` slot. **For now these
arrays are empty** — the card renders a fixed-height placeholder block (muted skeleton
rows + "Plan details synced from official site" note) so layout does not shift when
real content is added later. Live fetching of plan details from official sites is
**out of scope**; the data shape just leaves room for it.

---

## 5. Data model (`data.ts` / `types.ts`)

```ts
type TierId = 'standard' | 'pro' | 'ultra'
type ProviderId = 'openai' | 'anthropic' | 'google'
type DataLineId = 'cmcc-hk' | 'ct-hk' | 'us-mobile'

interface SubscriptionTier { labelKey: string; features: string[] } // features empty for now
interface Provider {
  id: ProviderId
  name: string                 // literal brand name, not translated
  logo: ...                    // @lobehub/icons component reference
  included: SubscriptionTier   // e.g. ChatGPT Plus
  upgrade: { labelKey: string; price: number; features: string[] }
}
interface DataLine { id: DataLineId; labelKey: string; price: number }
interface ContactItem { id: string; labelKey: string }
interface Preset { id: TierId; nameKey: string; descKey: string; price: number; dataLines: DataLineId[] }

const BASE_PRICE = 6666
```

Selection state (local `useState`):

```ts
interface Selection {
  upgrades: Set<ProviderId>
  dataLines: Set<DataLineId>
  appleId: boolean
}
```

Pure helper `computeTotal(selection): number` (unit-testable, no React).
A `matchPreset(selection)` helper returns the highlighted `TierId | null`.

---

## 6. Internationalization

All copy goes through `t()` (i18next), consistent with the home page. Add English
source keys in `web/default/src/i18n/locales/en.json` (keys are the English strings)
and Chinese translations in `zh.json`, then run `bun run i18n:sync` to propagate keys
to the other locales (fr/ru/ja/vi). Brand/product names (OpenAI, ChatGPT Plus, Claude
Max, Google AI Ultra, US Mobile, 中国移动, etc.) stay literal and are not translated.

---

## 7. Out of scope (explicit placeholders)

- **Proceed** button performs no action (renders as a normal button, no `onClick`).
- **Contact us** items perform no action (disabled-look CTA).
- **Live fetching** of subscription feature details from official sites — data model
  reserves the `features[]` slot only.
- No backend, no persistence, no checkout/cart wiring.

---

## 8. Protected information

Per project Rule 5, all `nеw-аρi` / `QuаntumΝоuѕ` branding, copyright headers, and
metadata are preserved. New files carry the standard QuantumNous AGPL copyright header
used throughout `web/default`.
