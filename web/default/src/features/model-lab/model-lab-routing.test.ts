import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, test } from 'node:test'

const srcRoot = resolve(import.meta.dirname, '../..')

function readSource(path: string): string {
  return readFileSync(resolve(srcRoot, path), 'utf8')
}

describe('Model Lab standalone routing', () => {
  test('mounts Model Lab as a standalone feature page at /model-lab', () => {
    assert.equal(
      existsSync(resolve(srcRoot, 'features/model-lab/index.tsx')),
      true
    )
    const routeSource = readSource('routes/model-lab.tsx')

    assert.match(routeSource, /createFileRoute\('\/model-lab'\)/)
    assert.match(routeSource, /ModelLabPage/)
    assert.match(routeSource, /validateSearch/)
  })

  test('defaults Model Lab sessions and links to compare mode', () => {
    const constantsSource = readSource('features/model-lab/constants.ts')
    const playgroundSource = readSource('features/playground/index.tsx')

    assert.match(
      constantsSource,
      /MODEL_LAB_COMPARE_PATH = '\/model-lab\?mode=compare'/
    )
    assert.match(playgroundSource, /queryMode === 'chat' \? 'chat' : 'compare'/)
    assert.match(playgroundSource, /initialModeApplied/)
    assert.match(playgroundSource, /if \(!initialModeApplied\) return/)
    assert.doesNotMatch(
      playgroundSource,
      /queryMode === 'compare' \? 'compare' : 'chat'/
    )
  })

  test('keeps /playground as a compatibility redirect into the standalone lab', () => {
    assert.equal(
      existsSync(
        resolve(srcRoot, 'routes/_authenticated/playground/index.tsx')
      ),
      false
    )
    const compatibilityRouteSource = readSource('routes/playground.tsx')

    assert.match(compatibilityRouteSource, /createFileRoute\('\/playground'\)/)
    assert.match(compatibilityRouteSource, /throw redirect\(/)
    assert.match(compatibilityRouteSource, /to: '\/model-lab'/)
    assert.match(compatibilityRouteSource, /mode: 'compare'/)
    assert.doesNotMatch(compatibilityRouteSource, /<Playground/)
  })

  test('remaps related Model Lab buttons and navigation to /model-lab compare mode', () => {
    const checkedFiles = [
      'features/home/components/sections/model-lab-spotlight.tsx',
      'features/dashboard/components/overview/overview-dashboard.tsx',
      'hooks/use-top-nav-links.ts',
      'hooks/use-sidebar-config.ts',
      'hooks/use-sidebar-data.ts',
    ]

    for (const file of checkedFiles) {
      const source = readSource(file)
      assert.match(source, /MODEL_LAB_COMPARE_PATH|MODEL_LAB_ROUTE/)
      assert.doesNotMatch(source, /['"]\/playground['"]/)
    }
  })

  test('uses Model Lab compare mode as the default post-sign-in target', () => {
    const signInSource = readSource('routes/(auth)/sign-in.tsx')
    const authOauthSource = readSource('routes/(auth)/oauth.tsx')
    const providerOauthSource = readSource('routes/oauth/$provider.tsx')
    const authRedirectSource = readSource(
      'features/auth/hooks/use-auth-redirect.ts'
    )

    for (const source of [
      signInSource,
      authOauthSource,
      providerOauthSource,
      authRedirectSource,
    ]) {
      assert.match(source, /resolveModelLabRedirectTarget/)
      assert.doesNotMatch(
        source,
        /redirect \|\| '\/dashboard'|target \|\| search\?\.redirect \|\| '\/dashboard'/
      )
    }
  })
})
