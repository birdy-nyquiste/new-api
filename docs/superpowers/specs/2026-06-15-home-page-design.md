# Home Page Redesign — Design Spec

**Date:** 2026-06-15  
**Branch:** `ui-polish`  
**Status:** Approved for implementation

---

## 1. Context

The existing home page was a generic feature-card layout with vague copy about "global AI configuration for Chinese users." This redesign rebuilds it from scratch to communicate the actual product clearly, drive signups, and use Model Lab as the primary activation hook.

---

## 2. Product Summary (for reference)

Nyquiste is a bundled AI subscription service targeted at individual professionals in mainland China who want reliable access to global AI tools without managing overseas accounts, VPNs, or foreign payment methods. The offering has three components:

| Component | Description |
|-----------|-------------|
| **AI Accounts** | Nyquiste creates and subscribes official accounts (OpenAI / Claude / Gemini) on behalf of the user. The user receives login credentials and uses the service directly. Annual subscription; provider selection is flexible. |
| **SIM / eSIM** | Global mobile data via China Telecom (Hong Kong). Provides stable, compliant internet routing. Pay-as-you-go. |
| **Nyquiste Router** | Unified API gateway. Included credit for base URL + API key access to all providers. Works with Cursor, VS Code, and any OpenAI-compatible tool. Not the primary selling point but included in all plans. |

**Model Lab** is a side-by-side model comparison tool built into the platform. It is used as the primary signup hook: new accounts receive free credits to try it immediately, no payment required.

**Payment:** Stripe-powered, supporting 微信支付 / 支付宝 / 银行卡 / international credit card.

---

## 3. Design Decisions

### 3.1 Audience
Individual professionals — people who want AI to just work, not a technical audience managing infrastructure.

### 3.2 Visual Direction
**Clean & Confident** — light backgrounds, near-black typography, generous whitespace. Equal first-class support for dark mode using the existing OKLch CSS variable system. No gradient text. No glow effects.

**Typography:** Plus Jakarta Sans (headings + body) + Lora italic (editorial accent on headline second lines). Plus Jakarta Sans requires a new dependency: `bun add @fontsource-variable/plus-jakarta-sans` from `web/default/`, then import in `index.css`. Lora is already present — `@fontsource-variable/lora` is already installed and imported in `web/default/src/styles/index.css`, and `--font-serif: 'Lora Variable', 'Lora', ...` is already set in `theme.css`. Existing Public Sans remains for non-landing UI.

**Color:** Existing OKLch tokens, lightly extended. All neutrals carry a subtle blue tint (`oklch(xx% 0.01 250)`) for subconscious brand cohesion. Accent: `oklch(52% 0.14 248)` light / `oklch(68% 0.14 248)` dark.

### 3.3 Page Structure
**Bundle-First** — opens by naming all three product components immediately. No narrative warm-up; the visitor should understand what Nyquiste is within the first screenful.

### 3.4 Conversion Flow
Hero (understand) → Pain vs Solution (relate) → Model Coverage (trust) → Model Lab CTA (activate) → Pricing (commit)

---

## 4. Section Specs

### Section 1 — Hero + Bundle Manifest

**Layout:** Two-column asymmetric grid. Left column: headline + CTA. Right column: bundle manifest panel (surface-2 background).

**Left column:**
- Free credits badge: neutral bordered pill, small blue accent dot. Copy: `"New accounts get free credits"`. No green fill.
- Headline: `"Global AI, without the setup."` — Plus Jakarta Sans 800, ~2.75rem, letter-spacing -1.5px. "without the setup." in Lora italic, `--ink-2` color.
- Subtext: `"One subscription covers your AI accounts, global mobile data, and API access — pre-configured, compliant, and ready on day one."`
- CTA pair: `"Get started free →"` (primary, ink fill) + `"View pricing"` (secondary, bordered).
- Trust chips: `GPT-4o` · `Claude Sonnet` · `Gemini 2.0` · `+ more` — small bordered pills, ink-3 color.

**Right column (manifest panel):**
- Label: `"What's in the package"` — uppercase, letter-spacing 2px, ink-3.
- Three manifest rows, each: SVG icon (36×36 bordered square) + title + description + billing tag.
  - **AI Accounts** — monitor icon — `"Official access to OpenAI, Claude, Gemini — pre-configured."` — tag: `Annual`
  - **SIM / eSIM** — wifi icon — `"Global data via China Telecom HK. Stable, compliant internet routing — no VPN needed."` — tag: `Flexible`
  - **API Router** — lightning icon — `"One API key for all providers. Works with any tool or IDE that supports OpenAI format."` — tag: `Included`
- Footer note: `"Sign up to explore Model Lab free — compare models side by side, then choose a plan."`

**i18n:** All strings via `t()`. Brand name `"Nyquiste 全球 AI 全家桶"` in nav — not translated. Model names (GPT-4o etc.) not translated; `"+ more"` is translated. Layout is `flex-wrap` and `break-words` safe for language expansion.

---

### Section 2 — Pain vs Solution

**Layout:** Three-column grid: before-column / arrow-divider / after-column. Max-width 960px centered.

**Eyebrow:** `"Why Nyquiste"`  
**Headline:** `"Getting global AI used to mean jumping through hoops."` — "used to mean" in Lora italic.

**Before column** (left, border-right):
- Heading: `"Without Nyquiste"` — ink-3, uppercase, with short leading line decoration.
- Four numbered pain items with line-through text styling:
  1. Apply for an overseas email and phone number just to sign up
  2. Need a foreign credit card — or find someone abroad to pay for you
  3. Set up a VPN — and hope it doesn't get blocked mid-session
  4. Repeat for every provider: ChatGPT, Claude, Gemini separately

**Divider:** Centered arrow circle (36px, bordered, surface-2 fill).

**After column** (right):
- Heading: `"With Nyquiste"` — accent color, uppercase.
- Four solution items with blue check circles:
  1. **We create and subscribe the accounts for you** — "Receive your OpenAI, Claude, or Gemini login — just sign in and use it."
  2. **Pay your way — local or international** — payment chips: 微信支付 · 支付宝 · 银行卡 · Credit card
  3. **SIM / eSIM for stable, compliant connectivity** — "China Telecom HK routing — reliable access without consumer VPN risk"
  4. **Nyquiste Router credit included** — "Use any AI model via base URL + API key — works with Cursor, VS Code, and any OpenAI-compatible tool"

---

### Section 3 — Model Coverage

**Layout:** Asymmetric 3-column grid (1.4fr + 1fr + 1fr) inside a single bordered container, gap-px style. Max-width 960px.

**Eyebrow:** `"What we support"`  
**Headline:** `"The world's leading AI, ready to use."` — "ready to use." in Lora italic.  
**Subtext:** `"We source and manage official subscriptions to the most capable AI models. Choose what you need — or mix and match."`

**Three provider cards:**

| Provider | Plan | Models shown |
|----------|------|--------------|
| OpenAI | ChatGPT Plus / Pro | GPT-4o (Flagship), o3 / o4-mini (Reasoning), GPT-4.1 (Latest), DALL·E 3 · Sora (Image/Video) |
| Anthropic | Claude Pro | Claude Opus 4 (Most capable), Claude Sonnet 4.6 (Balanced), Claude Haiku 4.5 (Fast) |
| Google | Gemini Advanced | Gemini 2.5 Pro (Flagship), Gemini 2.0 Flash (Fast), NotebookLM Plus (Research) |

Each card: wordmark (800 weight typography) + plan badge (accent-surface) + model rows (surface-2 backgrounds, name + category label) + one-line description (italic, ink-3, border-top).

**"Need other providers?" row** below grid: label + chips (Perplexity · Midjourney · Grok / xAI) + `"Contact us →"` accent chip.

---

### Section 4 — Model Lab Spotlight

**Layout:** Full-width bordered callout panel (1.5px border, 16px radius). Two-column: left = headline + features, right = CTA stack.

**Eyebrow:** `"Model Lab"` — accent color.  
**Headline:** `"Compare every model, with one prompt."` — "with one prompt." in Lora italic.  
**Subtext:** `"Send the same message to GPT-4o, Claude, and Gemini simultaneously. See how each model thinks, writes, and reasons — then decide which fits your workflow."`

**Feature bullets** (accent dot + text):
- Side-by-side responses in real time
- Switch models without retyping your prompt
- Token count and response time for each model

**Right CTA block:**
- Free credits pill: neutral bordered, copy `"New accounts get free credits"`.
- Primary button: `"Try Model Lab →"` — ink fill.
- Secondary link: `"or view pricing first"` — underlined, ink-3.

**No UI preview mockup.** No always-dark override — section inherits page theme.

---

### Section 5 — Pricing

**Layout:** Comparison table. Feature labels in left column (30% width), three plan columns (equal). HTML `<table>` for correct row alignment. Max-width 960px.

**Eyebrow:** `"Pricing"`  
**Headline:** `"Simple, transparent plans."` — "transparent" in Lora italic.  
**Subtext:** `"All plans include Nyquiste Router credit and Model Lab access. Billed annually."`

**Plans:**

| | Pro | Ultra | Custom |
|--|-----|-------|--------|
| Description | One AI account and connectivity to get started | All three accounts, SIM data, and full API access | Other providers, multiple seats, or tailored quotas |
| Price | ¥XXX / yr | ¥XXX / yr | Contact us |
| Billing | Annual · 微信 / 支付宝 / Card | Annual · 微信 / 支付宝 / Card | Flexible |
| AI Accounts | 1 account (choice) | OpenAI + Claude + Gemini | Any provider |
| SIM / eSIM | Add-on available | Included | Included |
| Router credit | Included | Included | Custom quota |
| Model Lab | Included | Included | Included |
| Support | Standard | Priority | Dedicated |

**No plan highlighting.** No "most popular" badge. All three columns visually equal — user decides. Prices are placeholders (¥XXX) to be filled in.

**CTA row:** `"Get Pro"` · `"Get Ultra"` · `"Contact us"` — all identical bordered buttons.

---

### Section 6 — Final CTA

**Layout:** Centered text block, border-top separator, padding 64px vertical.

**Headline:** `"Global AI, starting today."` — "starting today." in Lora italic.  
**Subtext:** `"Create your account, get free credits, and try Model Lab before committing to a plan."`  
**Buttons:** `"Get started free →"` (primary) + `"View pricing"` (secondary bordered).

---

### Footer

Minimal. Two columns: `"© 2026 Nyquiste · 全球 AI 全家桶"` left, `Privacy · Terms · Contact` links right.

---

## 5. Implementation Notes

### File Structure
New home page replaces existing files under `web/default/src/features/home/`. Section components:

```
features/home/
  index.tsx                      — orchestrator (unchanged logic for custom home page)
  components/sections/
    hero.tsx                     — Hero + Bundle Manifest (replaces existing)
    pain-solution.tsx            — Pain vs Solution (new)
    model-coverage.tsx           — Provider cards (replaces features.tsx)
    model-lab-spotlight.tsx      — Model Lab CTA (new, replaces how-it-works.tsx + cta.tsx)
    pricing-teaser.tsx           — Pricing table (new)
    final-cta.tsx                — Final CTA (new)
  components/
    manifest-row.tsx             — Reusable bundle manifest row
    provider-card.tsx            — Provider card with model list
```

### Styling
- Uses existing Tailwind CSS 4 + OKLch CSS variable system from `theme.css`
- **Plus Jakarta Sans** (new dependency): run `bun add @fontsource-variable/plus-jakarta-sans` from `web/default/`, then add `@import '@fontsource-variable/plus-jakarta-sans'` in `web/default/src/styles/index.css`
- **Lora** (already available): `@fontsource-variable/lora` is already in `package.json` and imported in `index.css`; `--font-serif` is already set in `theme.css` — no action needed
- All `dark:` variants mirror the light layout with inverted CSS variable values

### Integration with Current Implementation
The home page entry point at `web/default/src/features/home/index.tsx` is **preserved unchanged** — it handles:
1. `useHomePageContent()` hook — checks for a custom Markdown/iframe home page from the backend; if set, renders that instead of the default landing page. This check stays.
2. Renders `<PublicLayout showMainContainer={false}>` — sections are full-width with no container padding imposed by the layout wrapper. Each new section component controls its own max-width and padding.
3. Props: `isAuthenticated: boolean` is passed down to sections that gate content (Hero, Final CTA, free credits badge).

**What changes:** The section components rendered inside `<PublicLayout>` are replaced. Old components (`Hero`, `Features`, `HowItWorks`, `CTA`) are swapped for the new ones. The existing `<Footer>` import from `@/components/layout/components/footer` remains at the bottom.

**Public header** (`public-header.tsx`) is not modified — it already includes nav links, language switcher, theme switch, and auth buttons.

### i18n

**Ground truth language is Chinese.** All home page copy is written in Chinese first. Other locales (en, fr, ru, ja, vi) are translated from Chinese.

**Key convention:** i18n keys follow the existing project pattern — English-readable developer identifiers (e.g., `"Global AI, without the setup."`). The zh.json value is the canonical Chinese copy authored by the product owner. en.json and other locales contain translations derived from the Chinese.

| Locale | Role |
|--------|------|
| zh | Canonical copy — written first, authoritative |
| en | Translated from zh |
| fr, ru, ja, vi | Translated from zh |

**Workflow for new strings:**
1. Write the Chinese copy in `zh.json` under the English key
2. Write the English translation in `en.json`
3. Run `bun run i18n:sync` from `web/default/` to generate stubs in fr/ru/ja/vi
4. Fill in remaining locale stubs manually or via translation tooling

**Brand name rules:**
- `"Nyquiste"` — company name, **never translated**, never in a `t()` key, rendered as a literal string everywhere
- `"全球 AI 全家桶"` — product tagline, **translatable**, wrapped in `t()`, zh.json value is the canonical form
- Model names (GPT-4o, Claude Sonnet, Gemini 2.5 Pro, etc.) — not translated, rendered as literals
- Payment method names (微信支付, 支付宝, 银行卡) — not translated, rendered as literals in all locales

### Animations
- Existing `AnimateInView` component used for scroll-triggered fade-up on section headers and cards
- Hero elements use existing `landing-animate-fade-up` keyframe class with staggered `animationDelay`
- No new animation primitives needed

### Responsive

All sections are implemented **mobile-first** — base styles target `≥375px`, breakpoints widen at `sm` (640px), `md` (768px), `lg` (1024px).

**Touch targets:** All interactive elements (buttons, links, chips) must be at least `44×44px` touch target on mobile (use `min-h-[44px]` + sufficient padding).

**Section-by-section breakdown:**

| Section | Mobile (< md) | Tablet (md–lg) | Desktop (≥ lg) |
|---------|--------------|----------------|----------------|
| **Hero** | Single column; manifest panel stacks below headline; CTAs full-width | Single column; manifest panel below | Two-column asymmetric |
| **Pain vs Solution** | Vertical stack: before-block → arrow → after-block; no side-by-side columns | Vertical stack | Three-column (before / arrow / after) |
| **Model Coverage** | Single column; each provider card full-width | Two-column grid (1 card full-width below) | Asymmetric 3-column |
| **Model Lab** | Single column; CTA stack below copy | Single column | Two-column (copy left, CTA right) |
| **Pricing** | Horizontal-scroll container wrapping the `<table>`; or collapsed to card-per-plan view | Horizontal scroll | Full table visible |
| **Final CTA** | Centered, buttons full-width | Same | Centered, buttons inline |

**Typography scaling:** All headline `font-size` values use `clamp()` for fluid scaling between mobile and desktop minimums/maximums:
- Hero headline: `clamp(1.75rem, 5vw, 2.75rem)`
- Section headlines: `clamp(1.5rem, 3.5vw, 2.2rem)`
- Eyebrows and labels: fixed size (no scaling needed)

**Spacing:** Section vertical padding scales: `py-12 md:py-16 lg:py-20` pattern.

**Nav (mobile):** The existing `PublicHeader` already handles mobile navigation — no changes needed.

### Authenticated Users
The existing `isAuthenticated` prop is preserved. When authenticated:
- `"Get started free"` CTA → links to `/dashboard` instead of `/sign-up`
- Final CTA section is hidden (matches existing behavior)
- Free credits badge is hidden

---

## 6. Out of Scope

- Pricing page (`/pricing`) redesign — this spec only covers the teaser table on the home page
- Model Lab page (`/playground`) redesign
- Navigation / header redesign
- Footer redesign beyond the home page footer strip
- Animation timing fine-tuning (handled during implementation review)
