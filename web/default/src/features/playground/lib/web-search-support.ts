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
import type { ModelOption } from '../types'

/**
 * Web search support level for a model:
 * - 'unsupported': no signal that the model supports web search; the toggle
 *   is disabled and `web_search_options` is never sent.
 * - 'supported': the relay can enable web search via `web_search_options`
 *   (Claude/Gemini conversion, or native OpenAI search-preview models).
 * - 'builtin': search is implied by the model itself (name suffix like
 *   `-online`/`-search`/`-internet`); the upstream always searches and
 *   `web_search_options` must NOT be sent to avoid unknown-parameter errors.
 */
export type WebSearchSupport = 'unsupported' | 'supported' | 'builtin'

// OpenAI `*-search-preview` models natively accept `web_search_options`
// on chat completions — treat as 'supported', not 'builtin'.
const OPENAI_SEARCH_PREVIEW_PATTERN = /-search-preview/i

// Models whose name implies always-on, built-in web search handled by the
// channel adapter (xAI/Baidu `-search`, Qwen `-internet`, Perplexity `-online`).
const BUILTIN_SEARCH_PATTERNS = [
  /-online$/i,
  /-search$/i,
  /-internet$/i,
  /perplexity/i,
  /web[-_ ]?search/i,
]

// Endpoint types whose relay adapters translate `web_search_options`
// into the provider's native web search tool.
const SUPPORTED_ENDPOINT_TYPES = new Set(['anthropic', 'gemini'])

// Name fallback when endpoint types are unavailable: the Claude and Gemini
// adapters translate `web_search_options` for these model families.
const SUPPORTED_NAME_PATTERNS = [/claude/i, /gemini/i]

/**
 * Infer whether (and how) a model supports web search.
 *
 * Signals, in priority order:
 * 1. Built-in search name suffixes -> 'builtin'
 * 2. Explicit admin `search` tag on the model -> 'supported'
 * 3. Endpoint types (anthropic/gemini) or OpenAI search-preview naming -> 'supported'
 * 4. Claude/Gemini model-name fallback -> 'supported'
 */
export function getWebSearchSupport(
  model: ModelOption | undefined,
  modelName?: string
): WebSearchSupport {
  const name = model?.value || modelName || ''
  if (!name) return 'unsupported'

  if (OPENAI_SEARCH_PREVIEW_PATTERN.test(name)) return 'supported'
  if (BUILTIN_SEARCH_PATTERNS.some((re) => re.test(name))) return 'builtin'

  if (model?.tags?.some((tag) => tag === 'search')) return 'supported'
  if (
    model?.supportedEndpointTypes?.some((e) => SUPPORTED_ENDPOINT_TYPES.has(e))
  ) {
    return 'supported'
  }
  if (SUPPORTED_NAME_PATTERNS.some((re) => re.test(name))) return 'supported'

  return 'unsupported'
}
