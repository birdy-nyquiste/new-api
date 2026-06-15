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
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import i18next from 'i18next'
import { toast } from 'sonner'
import { getHomePageContent } from '../api'
import type { HomePageContentResult } from '../types'

const STORAGE_KEY = 'home_page_content'

function readCachedContent() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function cacheContent(content: string) {
  try {
    if (content) {
      localStorage.setItem(STORAGE_KEY, content)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* Storage can be unavailable in private browsing or locked-down contexts. */
  }
}

/**
 * Hook to load and manage custom home page content
 * Supports both Markdown/HTML content and iframe URLs
 */
export function useHomePageContent(): HomePageContentResult {
  const [content, setContent] = useState<string>(() => readCachedContent())
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadContent = useCallback(
    async (signal?: AbortSignal, options?: { showToast?: boolean }) => {
      try {
        const response = await getHomePageContent({ signal })
        const { success, data, message } = response

        if (signal?.aborted) return

        if (success) {
          const nextContent = typeof data === 'string' ? data : ''
          setContent(nextContent)
          setError(null)
          cacheContent(nextContent)
          return
        }

        const nextError =
          message || i18next.t('Failed to load home page content')
        setError(nextError)
        if (options?.showToast) {
          toast.error(nextError)
        }
      } catch (loadError) {
        if (signal?.aborted || axios.isCancel(loadError)) return

        const nextError = i18next.t('Failed to load home page content')
        setError(nextError)
        if (options?.showToast) {
          toast.error(nextError)
        }
        // eslint-disable-next-line no-console
        console.error('Failed to load home page content:', loadError)
      } finally {
        if (!signal?.aborted) {
          setIsLoaded(true)
          setIsRefreshing(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    const controller = new AbortController()

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContent(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadContent])

  const isUrl = useMemo(() => {
    try {
      const url = new URL(content.trim())
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }, [content])

  const reload = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)
    await loadContent(undefined, { showToast: true })
  }, [loadContent])

  return { content, error, isLoaded, isRefreshing, isUrl, reload }
}
