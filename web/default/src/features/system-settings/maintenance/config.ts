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
export type HeaderNavAccessConfig = {
  enabled: boolean
  requireAuth: boolean
}

export type HeaderNavModulesConfig = {
  home: boolean
  console: boolean
  modelLab: boolean
  pricing: HeaderNavAccessConfig
  rankings: HeaderNavAccessConfig
  docs: boolean
  about: boolean
  search: boolean
  announcements: boolean
  theme: boolean
  [key: string]: boolean | HeaderNavAccessConfig
}

/** Card-level visibility within a single page/module (third hierarchy level). */
export type SidebarCardConfig = Record<string, boolean>

/**
 * A page/module entry inside a sidebar section.
 * - `boolean`: simple page with no inner card toggles (legacy shape).
 * - object form: page that exposes card-level children.
 */
export type SidebarModuleNode =
  | boolean
  | { enabled: boolean; cards: SidebarCardConfig }

export type SidebarSectionConfig = {
  enabled: boolean
  [moduleKey: string]: SidebarModuleNode
}

export type SidebarModulesAdminConfig = Record<string, SidebarSectionConfig>

export type ProfileModulesAdminConfig = {
  notifications: boolean
  language: boolean
  security: boolean
  checkin: boolean
  passkey: boolean
  twoFactor: boolean
  accountBindings: boolean
  sidebarSettings: boolean
  [key: string]: boolean
}

export const HEADER_NAV_DEFAULT: HeaderNavModulesConfig = {
  home: true,
  console: true,
  modelLab: true,
  pricing: {
    enabled: true,
    requireAuth: false,
  },
  rankings: {
    enabled: true,
    requireAuth: false,
  },
  docs: true,
  about: true,
  search: true,
  announcements: true,
  theme: true,
}

export const PROFILE_MODULES_DEFAULT: ProfileModulesAdminConfig = {
  notifications: true,
  language: true,
  security: true,
  checkin: true,
  passkey: false,
  twoFactor: false,
  accountBindings: false,
  sidebarSettings: false,
}

export const SIDEBAR_MODULES_DEFAULT: SidebarModulesAdminConfig = {
  chat: {
    enabled: true,
    playground: true,
    modelCompare: true,
    chat: true,
  },
  console: {
    enabled: true,
    // Overview page exposes its cards as third-level toggles.
    overview: {
      enabled: true,
      cards: {
        setupGuide: true,
        performanceHealth: true,
        uptime: true,
        apiInfo: true,
        announcements: true,
        faq: true,
      },
    },
    dashboard: true,
    token: true,
    log: true,
    midjourney: true,
    task: true,
  },
  personal: {
    enabled: true,
    // Wallet page exposes its cards as third-level toggles.
    topup: {
      enabled: true,
      cards: {
        referral: true,
      },
    },
    // Profile page exposes its cards as third-level toggles.
    personal: {
      enabled: true,
      cards: { ...PROFILE_MODULES_DEFAULT },
    },
  },
  admin: {
    enabled: true,
    channel: true,
    models: true,
    redemption: true,
    user: true,
    setting: true,
    subscription: true,
  },
}

const toBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
  }
  return fallback
}

const cloneHeaderNavDefault = (): HeaderNavModulesConfig => ({
  ...HEADER_NAV_DEFAULT,
  pricing: { ...HEADER_NAV_DEFAULT.pricing },
  rankings: { ...HEADER_NAV_DEFAULT.rankings },
})

const parseAccessModule = (
  raw: unknown,
  fallback: HeaderNavAccessConfig
): HeaderNavAccessConfig => {
  if (
    typeof raw === 'boolean' ||
    typeof raw === 'string' ||
    typeof raw === 'number'
  ) {
    return {
      enabled: toBoolean(raw, fallback.enabled),
      requireAuth: fallback.requireAuth,
    }
  }
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    return {
      enabled: toBoolean(record.enabled, fallback.enabled),
      requireAuth: toBoolean(record.requireAuth, fallback.requireAuth),
    }
  }
  return { ...fallback }
}

const cloneModuleNode = (node: SidebarModuleNode): SidebarModuleNode =>
  typeof node === 'object'
    ? { enabled: node.enabled, cards: { ...node.cards } }
    : node

const cloneSidebarSection = (
  config: SidebarSectionConfig
): SidebarSectionConfig =>
  Object.entries(config).reduce<SidebarSectionConfig>(
    (acc, [key, value]) => {
      acc[key] = key === 'enabled' ? value : cloneModuleNode(value)
      return acc
    },
    { enabled: config.enabled }
  )

const cloneSidebarDefault = (): SidebarModulesAdminConfig =>
  Object.entries(SIDEBAR_MODULES_DEFAULT).reduce<SidebarModulesAdminConfig>(
    (acc, [section, config]) => {
      acc[section] = cloneSidebarSection(config)
      return acc
    },
    {}
  )

/**
 * Parse a single module value against its default node, preserving the
 * default's shape (boolean stays boolean; card-bearing modules stay objects).
 */
const parseModuleNode = (
  raw: unknown,
  defaultNode: SidebarModuleNode
): SidebarModuleNode => {
  if (typeof defaultNode === 'object') {
    const cards: SidebarCardConfig = { ...defaultNode.cards }
    let enabled = defaultNode.enabled
    if (raw && typeof raw === 'object') {
      const record = raw as Record<string, unknown>
      enabled = toBoolean(record.enabled, defaultNode.enabled)
      const rawCards =
        record.cards && typeof record.cards === 'object'
          ? (record.cards as Record<string, unknown>)
          : {}
      Object.keys(cards).forEach((cardKey) => {
        cards[cardKey] = toBoolean(rawCards[cardKey], cards[cardKey])
      })
      Object.entries(rawCards).forEach(([cardKey, cardValue]) => {
        if (!(cardKey in cards)) cards[cardKey] = toBoolean(cardValue, true)
      })
    } else if (
      typeof raw === 'boolean' ||
      typeof raw === 'string' ||
      typeof raw === 'number'
    ) {
      // Legacy boolean stored for a module that now carries cards.
      enabled = toBoolean(raw, defaultNode.enabled)
    }
    return { enabled, cards }
  }

  return toBoolean(raw, defaultNode)
}

const cloneProfileDefault = (): ProfileModulesAdminConfig => ({
  ...PROFILE_MODULES_DEFAULT,
})

export function parseHeaderNavModules(
  value: string | null | undefined
): HeaderNavModulesConfig {
  const base = cloneHeaderNavDefault()
  if (!value) {
    return base
  }
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const result: HeaderNavModulesConfig = {
      ...base,
      pricing: { ...base.pricing },
      rankings: { ...base.rankings },
    }

    Object.entries(parsed).forEach(([key, raw]) => {
      if (key === 'pricing') {
        result.pricing = parseAccessModule(raw, base.pricing)
        return
      }
      if (key === 'rankings') {
        result.rankings = parseAccessModule(raw, base.rankings)
        return
      }

      if (typeof raw === 'boolean') {
        result[key] = raw
        return
      }
      if (typeof raw === 'string' || typeof raw === 'number') {
        result[key] = toBoolean(raw, Boolean(base[key]))
        return
      }
    })

    return result
  } catch {
    return base
  }
}

export function serializeHeaderNavModules(
  config: HeaderNavModulesConfig
): string {
  return JSON.stringify(config)
}

/** Detect whether stored sidebar JSON already carries Profile card toggles. */
function storedSidebarHasProfileCards(
  value: string | null | undefined
): boolean {
  if (!value || value.trim() === '') return false
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const personal = parsed?.personal as Record<string, unknown> | undefined
    const profile = personal?.personal as Record<string, unknown> | undefined
    return Boolean(
      profile &&
      typeof profile === 'object' &&
      typeof profile.cards === 'object'
    )
  } catch {
    return false
  }
}

/**
 * Parse the admin sidebar config.
 *
 * @param value stored `SidebarModulesAdmin` JSON string.
 * @param legacyProfileValue stored `ProfileModulesAdmin` JSON string. When the
 *   sidebar config does not yet carry Profile cards, the legacy profile values
 *   are folded into `personal.personal.cards` so existing installs keep their
 *   settings after Profile modules moved under the sidebar tree.
 */
export function parseSidebarModulesAdmin(
  value: string | null | undefined,
  legacyProfileValue?: string | null | undefined
): SidebarModulesAdminConfig {
  const defaults = cloneSidebarDefault()

  let parsed: Record<string, unknown> | null = null
  if (value && value.trim() !== '') {
    try {
      parsed = JSON.parse(value) as Record<string, unknown>
    } catch {
      parsed = null
    }
  }

  const result: SidebarModulesAdminConfig = {}

  // Iterate the known default sections/modules only. This drops any legacy keys
  // from stored configs (e.g. the old `console.detail`) so they don't surface
  // as stray toggles in the admin UI.
  Object.keys(defaults).forEach((sectionKey) => {
    const defaultSection = defaults[sectionKey]
    const rawSection = parsed?.[sectionKey]
    const rawSectionObj =
      rawSection && typeof rawSection === 'object'
        ? (rawSection as Record<string, unknown>)
        : null

    const sectionConfig: SidebarSectionConfig = {
      enabled: toBoolean(
        rawSectionObj?.enabled,
        defaultSection.enabled ?? true
      ),
    }

    Object.keys(defaultSection).forEach((moduleKey) => {
      if (moduleKey === 'enabled') return
      sectionConfig[moduleKey] = parseModuleNode(
        rawSectionObj?.[moduleKey],
        defaultSection[moduleKey] ?? true
      )
    })

    result[sectionKey] = sectionConfig
  })

  // Migration: the old single `console.detail` toggle was split into separate
  // `overview` and `dashboard` modules. When a stored config still uses
  // `detail` (and lacks the new keys), carry its value into both.
  const rawConsole = parsed?.console as Record<string, unknown> | undefined
  if (
    rawConsole &&
    'detail' in rawConsole &&
    !('overview' in rawConsole) &&
    !('dashboard' in rawConsole)
  ) {
    const detailVal = toBoolean(rawConsole.detail, true)
    const overviewNode = result.console.overview
    if (overviewNode && typeof overviewNode === 'object') {
      overviewNode.enabled = detailVal
    } else {
      result.console.overview = detailVal
    }
    result.console.dashboard = detailVal
  }

  // Fold legacy ProfileModulesAdmin into Profile cards for existing installs.
  if (legacyProfileValue && !storedSidebarHasProfileCards(value)) {
    const profileNode = result.personal?.personal
    if (profileNode && typeof profileNode === 'object') {
      const legacy = parseProfileModulesAdmin(legacyProfileValue)
      Object.keys(profileNode.cards).forEach((cardKey) => {
        if (cardKey in legacy) profileNode.cards[cardKey] = legacy[cardKey]
      })
    }
  }

  return result
}

export function serializeSidebarModulesAdmin(
  config: SidebarModulesAdminConfig
): string {
  return JSON.stringify(config)
}

export function parseProfileModulesAdmin(
  value: string | null | undefined
): ProfileModulesAdminConfig {
  const defaults = cloneProfileDefault()
  if (!value || value.trim() === '') return defaults

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const result = cloneProfileDefault()

    Object.entries(parsed).forEach(([key, raw]) => {
      result[key] = toBoolean(raw, defaults[key] ?? true)
    })

    return result
  } catch {
    return defaults
  }
}
