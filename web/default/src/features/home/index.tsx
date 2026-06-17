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
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/ui/markdown'
import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'
import {
  AudienceUseCases,
  CustomConfiguration,
  FinalCTA,
  Hero,
  HomeFAQ,
  ModelCoverage,
  ModelLabSpotlight,
  PainVsSolution,
  SimConnectivity,
} from './components'
import { useHomePageContent } from './hooks'

export function Home() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const isAuthenticated = !!auth.user
  const { content, error, isRefreshing, isUrl, reload } =
    useHomePageContent()

  const defaultHome = (
    <>
      {error && (
        <div className='px-4 pt-4 sm:px-6'>
          <Alert className='mx-auto max-w-5xl items-start gap-3 [overflow-wrap:anywhere]'>
            <AlertDescription className='flex min-w-0 flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between'>
              <span className='min-w-0 break-words'>
                {t('Failed to load home page content')}
              </span>
              <Button
                className='min-h-[40px] shrink-0 self-start sm:self-center'
                disabled={isRefreshing}
                onClick={() => {
                  void reload()
                }}
                size='sm'
                variant='outline'
              >
                {isRefreshing ? t('Refreshing...') : t('Retry')}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      <Hero isAuthenticated={isAuthenticated} />
      <PainVsSolution />
      <ModelCoverage />
      <CustomConfiguration />
      <SimConnectivity />
      <AudienceUseCases />
      <ModelLabSpotlight isAuthenticated={isAuthenticated} />
      <HomeFAQ />
      <FinalCTA isAuthenticated={isAuthenticated} />
      <Footer />
    </>
  )

  if (content) {
    return (
      <PublicLayout showMainContainer={false}>
        <main className='min-w-0 overflow-x-hidden'>
          {isUrl ? (
            <iframe
              src={content.trim()}
              className='h-[100dvh] min-h-screen w-full border-none'
              loading='lazy'
              referrerPolicy='no-referrer'
              sandbox='allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
              title={t('Custom Home Page')}
            />
          ) : (
            <div className='container mx-auto min-w-0 px-4 py-8 sm:px-6'>
              <Markdown className='custom-home-content prose-pre:max-w-full prose-pre:overflow-x-auto prose-table:block prose-table:max-w-full prose-table:overflow-x-auto prose-img:max-w-full min-w-0 [overflow-wrap:anywhere]'>
                {content}
              </Markdown>
            </div>
          )}
        </main>
      </PublicLayout>
    )
  }

  return <PublicLayout showMainContainer={false}>{defaultHome}</PublicLayout>
}
