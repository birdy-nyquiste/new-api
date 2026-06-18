import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  APPLE_ID,
  BASE_PRICE,
  GLOBAL_DATA_LINES,
  PLAN_CONFIG_CURRENCY,
  PRESETS,
  PROVIDERS,
} from './data'
import { computeTotal, formatPlanPrice } from './pricing'
import type { Selection } from './types'

const currentDir = dirname(fileURLToPath(import.meta.url))

describe('plan-config pricing model', () => {
  test('uses the requested USD prices for presets and add-ons', () => {
    assert.deepEqual(PLAN_CONFIG_CURRENCY, {
      code: 'USD',
      symbol: '$',
      locale: 'en-US',
    })
    assert.equal(BASE_PRICE, 999)
    assert.deepEqual(
      Object.fromEntries(PRESETS.map((preset) => [preset.id, preset.price])),
      { standard: 999, pro: 1299, ultra: 1499 }
    )
    assert.ok(PROVIDERS.every((provider) => provider.upgrade.price === 1099))
    assert.deepEqual(
      Object.fromEntries(
        GLOBAL_DATA_LINES.map((line) => [line.id, line.price])
      ),
      { 'cmcc-hk': 300, 'ct-hk': 300, 'us-mobile': 500 }
    )
    assert.equal(APPLE_ID.price, 20)
  })

  test('preset prices add up from their configured options', () => {
    const linePrices = new Map(
      GLOBAL_DATA_LINES.map((line) => [line.id, line.price])
    )
    const upgradePrices = new Map(
      PROVIDERS.map((provider) => [provider.id, provider.upgrade.price])
    )

    for (const preset of PRESETS) {
      const addOnTotal =
        preset.dataLines.reduce(
          (sum, id) => sum + (linePrices.get(id) ?? 0),
          0
        ) +
        preset.upgrades.reduce(
          (sum, id) => sum + (upgradePrices.get(id) ?? 0),
          0
        )

      assert.equal(preset.price, BASE_PRICE + addOnTotal)
    }
  })

  test('calculates preset selections through the same add-up path', () => {
    const standard: Selection = { upgrades: [], dataLines: [], appleId: false }
    const pro: Selection = {
      upgrades: [],
      dataLines: [{ id: 'ct-hk', delivery: 'esim' }],
      appleId: false,
    }
    const ultra: Selection = {
      upgrades: [],
      dataLines: [{ id: 'us-mobile', delivery: 'esim' }],
      appleId: false,
    }

    assert.equal(computeTotal(standard), 999)
    assert.equal(computeTotal(pro), 1299)
    assert.equal(computeTotal(ultra), 1499)
  })

  test('calculates custom selections from the requested add-on prices', () => {
    const selection: Selection = {
      upgrades: ['openai', 'google'],
      dataLines: [
        { id: 'cmcc-hk', delivery: 'esim' },
        { id: 'ct-hk', delivery: 'esim' },
        { id: 'us-mobile', delivery: 'esim' },
      ],
      appleId: true,
    }

    assert.equal(
      computeTotal(selection),
      999 + 1099 + 1099 + 300 + 300 + 500 + 20
    )
  })

  test('formats prices as whole-dollar US currency', () => {
    assert.equal(formatPlanPrice(999), '$999')
    assert.equal(formatPlanPrice(1099, { withPlus: true }), '+$1,099')
  })

  test('renders plan-config prices with US dollar currency', () => {
    const files = [
      'components/addon-row.tsx',
      'components/provider-card.tsx',
      'components/summary-panel.tsx',
      'components/tier-selector.tsx',
    ]
    const source = files
      .map((file) => readFileSync(resolve(currentDir, file), 'utf8'))
      .join('\n')

    assert.doesNotMatch(source, /¥/)
  })

  test('renders contact rows and footer contact as mail links', () => {
    const dataSource = readFileSync(resolve(currentDir, 'data.ts'), 'utf8')
    const addonRowSource = readFileSync(
      resolve(currentDir, 'components/addon-row.tsx'),
      'utf8'
    )
    const footerSource = readFileSync(
      resolve(currentDir, '../../components/layout/components/footer.tsx'),
      'utf8'
    )

    assert.match(dataSource, /CONTACT_HREF = 'mailto:r@nyquiste\.com'/)
    assert.match(addonRowSource, /href=\{CONTACT_HREF\}/)
    assert.doesNotMatch(addonRowSource, /cursor-not-allowed/)
    assert.match(footerSource, /href: 'mailto:r@nyquiste\.com'/)
    assert.match(footerSource, /startsWith\('mailto:'\)/)
  })
})
