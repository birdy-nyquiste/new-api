import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, test } from 'node:test'
import { resolvePostSignInRedirectTarget } from '../auth/lib/redirect'
import { MODEL_LAB_COMPARE_PATH } from './constants'

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
    assert.match(routeSource, /search: \{ redirect: location\.href \}/)
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

  test('preserves the homepage Model Lab compare redirect through auth entry points', () => {
    const spotlightSource = readSource(
      'features/home/components/sections/model-lab-spotlight.tsx'
    )
    const signUpRouteSource = readSource('routes/(auth)/sign-up.tsx')
    const signUpSource = readSource('features/auth/sign-up/index.tsx')
    const signUpFormSource = readSource(
      'features/auth/sign-up/components/sign-up-form.tsx'
    )
    const signInSource = readSource('features/auth/sign-in/index.tsx')

    assert.match(spotlightSource, /MODEL_LAB_COMPARE_PATH/)
    assert.match(spotlightSource, /to='\/sign-up'/)
    assert.match(
      spotlightSource,
      /search=\{\{ redirect: MODEL_LAB_COMPARE_PATH \}\}/
    )

    assert.match(signUpRouteSource, /redirect: z\.string\(\)\.optional\(\)/)
    assert.match(signUpRouteSource, /validateSearch: searchSchema/)
    assert.match(signUpSource, /useSearch\(\{ from: '\/\(auth\)\/sign-up' \}\)/)
    assert.match(signUpSource, /to='\/sign-in'/)
    assert.match(signUpSource, /search=\{\{ redirect \}\}/)
    assert.match(signUpSource, /<SignUpForm redirectTo=\{redirect\} \/>/)
    assert.match(signUpFormSource, /redirectTo/)
    assert.match(signUpFormSource, /handleLoginSuccess\(.*redirectTo/s)

    assert.match(signInSource, /to='\/sign-up'/)
    assert.match(signInSource, /search=\{\{ redirect \}\}/)
  })

  test('sends unauthenticated public header Model Lab links directly to sign in', () => {
    const publicHeaderSource = readSource(
      'components/layout/components/public-header.tsx'
    )

    assert.match(publicHeaderSource, /if \(link\.requiresAuth\)/)
    assert.match(
      publicHeaderSource,
      /navigate\(\{ to: '\/sign-in', search: \{ redirect: link\.href \} \}\)/
    )
    assert.doesNotMatch(publicHeaderSource, /Sign in required/)
    assert.doesNotMatch(publicHeaderSource, /authPromptTarget/)
    assert.doesNotMatch(publicHeaderSource, /AUTH_PROMPT_SECONDS/)
  })

  test('uses explicit protected-route redirects and Model Lab compare as the default sign-in target', () => {
    assert.equal(resolvePostSignInRedirectTarget(), MODEL_LAB_COMPARE_PATH)
    assert.equal(resolvePostSignInRedirectTarget(''), MODEL_LAB_COMPARE_PATH)
    assert.equal(
      resolvePostSignInRedirectTarget('/model-lab?mode=compare'),
      '/model-lab?mode=compare'
    )
    assert.equal(resolvePostSignInRedirectTarget('/dashboard'), '/dashboard')
    assert.equal(resolvePostSignInRedirectTarget('/playground'), '/playground')

    const signInSource = readSource('routes/(auth)/sign-in.tsx')
    const authOauthSource = readSource('routes/(auth)/oauth.tsx')
    const providerOauthSource = readSource('routes/oauth/$provider.tsx')
    const authenticatedRouteSource = readSource(
      'routes/_authenticated/route.tsx'
    )
    const authRedirectSource = readSource(
      'features/auth/hooks/use-auth-redirect.ts'
    )

    for (const source of [
      signInSource,
      authOauthSource,
      providerOauthSource,
      authRedirectSource,
    ]) {
      assert.match(source, /resolvePostSignInRedirectTarget/)
      assert.doesNotMatch(
        source,
        /MODEL_LAB_COMPARE_PATH|resolveModelLabRedirectTarget/
      )
    }

    assert.match(
      authenticatedRouteSource,
      /search: \{ redirect: location\.href \}/
    )
  })
})
