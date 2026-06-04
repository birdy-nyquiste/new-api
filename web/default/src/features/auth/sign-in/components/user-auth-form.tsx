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
import { useEffect, useMemo, useState } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Loader2, LogIn, KeyRound, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  buildAssertionResult,
  prepareCredentialRequestOptions,
  isPasskeySupported as detectPasskeySupport,
} from '@/lib/passkey'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/password-input'
import { Turnstile } from '@/components/turnstile'
import {
  login,
  sendEmailOTP,
  verifyEmailOTP,
  wechatLoginByCode,
} from '@/features/auth/api'
import { LegalConsent } from '@/features/auth/components/legal-consent'
import { OAuthProviders } from '@/features/auth/components/oauth-providers'
import { loginFormSchema } from '@/features/auth/constants'
import { useAuthRedirect } from '@/features/auth/hooks/use-auth-redirect'
import { useTurnstile } from '@/features/auth/hooks/use-turnstile'
import { beginPasskeyLogin, finishPasskeyLogin } from '@/features/auth/passkey'
import type { AuthFormProps } from '@/features/auth/types'

type SignInMethod = 'email_otp' | 'password'

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: AuthFormProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [wechatCode, setWeChatCode] = useState('')
  const [agreedToLegal, setAgreedToLegal] = useState(false)
  const [passkeySupported, setPasskeySupported] = useState(false)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [emailOTP, setEmailOTP] = useState('')
  const [emailOTPCode, setEmailOTPCode] = useState('')
  const [emailOTPChallengeId, setEmailOTPChallengeId] = useState('')
  const [isEmailOTPSending, setIsEmailOTPSending] = useState(false)
  const [isEmailOTPVerifying, setIsEmailOTPVerifying] = useState(false)
  const [emailOTPCooldown, setEmailOTPCooldown] = useState(0)
  const [selectedMethod, setSelectedMethod] =
    useState<SignInMethod>('email_otp')
  const [isWeChatDialogOpen, setIsWeChatDialogOpen] = useState(false)
  const [isWeChatSubmitting, setIsWeChatSubmitting] = useState(false)
  const legalConsentErrorMessage = t('Please agree to the legal terms first')
  const loginFailedMessage = t('Login failed')

  const { status } = useStatus()
  const passkeyLoginEnabled = Boolean(
    status?.passkey_login ?? status?.data?.passkey_login
  )
  const passwordLoginEnabled =
    (status?.password_login_enabled ??
      status?.data?.password_login_enabled ??
      true) !== false
  const emailOTPLoginEnabled = Boolean(
    status?.email_otp_login_enabled ?? status?.data?.email_otp_login_enabled
  )
  const smtpConfigured = Boolean(
    status?.smtp_configured ?? status?.data?.smtp_configured
  )
  const emailOTPAvailable = emailOTPLoginEnabled && smtpConfigured
  const emailOTPCooldownSeconds = Number(
    status?.email_otp_resend_cooldown ??
      status?.data?.email_otp_resend_cooldown ??
      60
  )
  const {
    isTurnstileEnabled,
    turnstileSiteKey,
    turnstileToken,
    setTurnstileToken,
    validateTurnstile,
  } = useTurnstile()
  const { handleLoginSuccess, redirectTo2FA } = useAuthRedirect()

  const hasUserAgreement = Boolean(status?.user_agreement_enabled)
  const hasPrivacyPolicy = Boolean(status?.privacy_policy_enabled)
  const requiresLegalConsent = hasUserAgreement || hasPrivacyPolicy
  const passkeyButtonDisabled =
    isPasskeyLoading ||
    !passkeySupported ||
    (requiresLegalConsent && !agreedToLegal)
  const hasWeChatLogin = Boolean(status?.wechat_login)
  const hasOAuthLogin = Boolean(
    status?.github_oauth ||
    status?.discord_oauth ||
    status?.oidc_enabled ||
    status?.linuxdo_oauth ||
    status?.telegram_oauth ||
    (status?.custom_oauth_providers?.length ?? 0) > 0
  )
  const hasAlternativeLogin =
    passkeyLoginEnabled || hasWeChatLogin || hasOAuthLogin
  const activeMethod: SignInMethod =
    selectedMethod === 'email_otp' && emailOTPAvailable
      ? 'email_otp'
      : selectedMethod === 'password' && passwordLoginEnabled
        ? 'password'
        : emailOTPAvailable
          ? 'email_otp'
          : 'password'
  const canSwitchToPassword =
    activeMethod !== 'password' && passwordLoginEnabled
  const canSwitchToEmailOTP = activeMethod !== 'email_otp' && emailOTPAvailable

  useEffect(() => {
    if (requiresLegalConsent) {
      setAgreedToLegal(false)
    } else {
      setAgreedToLegal(true)
    }
  }, [requiresLegalConsent])

  useEffect(() => {
    detectPasskeySupport()
      .then(setPasskeySupported)
      .catch(() => setPasskeySupported(false))
  }, [])

  useEffect(() => {
    if (emailOTPCooldown <= 0) return
    const timer = window.setTimeout(() => {
      setEmailOTPCooldown((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [emailOTPCooldown])

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const wechatQrCodeUrl = useMemo(() => {
    return (
      status?.wechat_qrcode ||
      status?.wechat_qr_code ||
      status?.wechat_qrcode_image_url ||
      status?.wechat_qr_code_image_url ||
      status?.wechat_account_qrcode_image_url ||
      status?.WeChatAccountQRCodeImageURL ||
      status?.data?.wechat_qrcode ||
      status?.data?.WeChatAccountQRCodeImageURL ||
      ''
    )
  }, [status])

  async function onSubmit(data: z.infer<typeof loginFormSchema>) {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }

    if (!validateTurnstile()) return

    setIsLoading(true)
    try {
      const res = await login({
        username: data.username,
        password: data.password,
        turnstile: turnstileToken,
      })

      if (res.success) {
        if (res.data?.require_2fa) {
          redirectTo2FA()
          return
        }

        await handleLoginSuccess(res.data as { id?: number } | null, redirectTo)
        toast.success(t('Welcome back!'))
      }
    } catch (_error) {
      // Errors are handled by global interceptor
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendEmailOTP() {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }
    if (!emailOTP.trim()) {
      toast.error(t('Please enter your email'))
      return
    }
    if (!validateTurnstile()) return

    setIsEmailOTPSending(true)
    try {
      const res = await sendEmailOTP({
        email: emailOTP.trim(),
        purpose: 'login',
        turnstile: turnstileToken,
      })
      if (res.success) {
        const nextChallengeId =
          typeof res.data?.challenge_id === 'string'
            ? res.data.challenge_id
            : ''
        setEmailOTPChallengeId(nextChallengeId)
        setEmailOTPCooldown(emailOTPCooldownSeconds)
        toast.success(
          t('A verification code will arrive shortly if this email is eligible.')
        )
      } else {
        toast.error(res.message || t('Failed to send code'))
      }
    } catch (_error) {
      toast.error(t('Failed to send code'))
    } finally {
      setIsEmailOTPSending(false)
    }
  }

  async function handleVerifyEmailOTP() {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }
    if (!emailOTP.trim() || !emailOTPCode.trim() || !emailOTPChallengeId) {
      toast.error(t('Please enter email and verification code'))
      return
    }

    setIsEmailOTPVerifying(true)
    try {
      const res = await verifyEmailOTP({
        email: emailOTP.trim(),
        purpose: 'login',
        challenge_id: emailOTPChallengeId,
        code: emailOTPCode.trim(),
      })
      if (res.success) {
        if (res.data?.require_2fa) {
          redirectTo2FA()
          return
        }
        await handleLoginSuccess(res.data as { id?: number } | null, redirectTo)
        toast.success(t('Welcome back!'))
      } else {
        toast.error(res.message || loginFailedMessage)
      }
    } catch (_error) {
      toast.error(loginFailedMessage)
    } finally {
      setIsEmailOTPVerifying(false)
    }
  }

  const handleOpenWeChatDialog = () => {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }

    setIsWeChatDialogOpen(true)
  }

  const handleWeChatDialogChange = (open: boolean) => {
    setIsWeChatDialogOpen(open)
    if (!open) {
      setWeChatCode('')
      setIsWeChatSubmitting(false)
    }
  }

  async function handleWeChatLogin() {
    if (!wechatCode.trim()) {
      toast.error(t('Please enter the verification code'))
      return
    }

    setIsWeChatSubmitting(true)
    try {
      const res = await wechatLoginByCode(wechatCode)
      if (res?.success) {
        await handleLoginSuccess(res.data as { id?: number } | null, redirectTo)
        toast.success(t('Signed in via WeChat'))
        handleWeChatDialogChange(false)
      } else {
        toast.error(res?.message || loginFailedMessage)
      }
    } catch (_error) {
      toast.error(loginFailedMessage)
    } finally {
      setIsWeChatSubmitting(false)
    }
  }

  async function handlePasskeyLogin() {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }

    if (!passkeySupported) {
      toast.error(t('Passkey is not supported on this device'))
      return
    }

    if (!navigator?.credentials) {
      toast.error(t('Passkey is not available in this browser'))
      return
    }

    setIsPasskeyLoading(true)
    try {
      const begin = await beginPasskeyLogin()
      if (!begin.success) {
        throw new Error(begin.message || t('Failed to start Passkey login'))
      }

      const publicKey = prepareCredentialRequestOptions(
        begin.data?.options ?? begin.data
      )

      const credential = (await navigator.credentials.get({
        publicKey,
      })) as PublicKeyCredential | null

      if (!credential) {
        toast.info(t('Passkey login was cancelled'))
        return
      }

      const assertion = buildAssertionResult(credential)
      if (!assertion) {
        throw new Error(t('Invalid Passkey response'))
      }

      const finish = await finishPasskeyLogin(assertion)
      if (!finish.success) {
        throw new Error(finish.message || t('Failed to complete Passkey login'))
      }

      if (!finish.data) {
        throw new Error(t('Missing user data from Passkey login response'))
      }

      await handleLoginSuccess(
        finish.data as { id?: number } | null,
        redirectTo
      )
      toast.success(t('Signed in with Passkey'))
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.info(t('Passkey login was cancelled or timed out'))
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(t('Passkey login failed'))
      }
    } finally {
      setIsPasskeyLoading(false)
    }
  }

  const alternativeLoginMethods = (
    <>
      {passkeyLoginEnabled && (
        <div className='mt-2 space-y-1'>
          <Button
            type='button'
            variant='outline'
            disabled={passkeyButtonDisabled}
            onClick={handlePasskeyLogin}
            className='h-11 w-full justify-center gap-2 rounded-lg'
          >
            {isPasskeyLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <KeyRound className='h-4 w-4' />
            )}
            {t('Sign in with Passkey')}
          </Button>
          {!passkeySupported && (
            <p className='text-muted-foreground text-xs'>
              {t('Passkey is not supported on this device.')}
            </p>
          )}
        </div>
      )}

      {/* OAuth Providers */}
      <OAuthProviders
        status={status}
        disabled={isLoading || (requiresLegalConsent && !agreedToLegal)}
        onWeChatLogin={hasWeChatLogin ? handleOpenWeChatDialog : undefined}
        isWeChatLoading={isWeChatSubmitting}
      />
    </>
  )

  return (
    <Form {...form}>
      <form
        onSubmit={
          activeMethod === 'password'
            ? form.handleSubmit(onSubmit)
            : (event) => event.preventDefault()
        }
        className={cn('grid gap-4', className)}
        {...props}
      >
        {activeMethod === 'email_otp' && emailOTPAvailable && (
          <div className='grid gap-3'>
            <div className='grid gap-2'>
              <Label htmlFor='signin-email-otp'>{t('Email')}</Label>
              <Input
                id='signin-email-otp'
                type='email'
                autoComplete='email'
                placeholder={t('name@example.com')}
                value={emailOTP}
                disabled={isEmailOTPSending || isEmailOTPVerifying}
                onChange={(event) => {
                  setEmailOTP(event.target.value)
                  setEmailOTPChallengeId('')
                  setEmailOTPCode('')
                }}
              />
            </div>
            <div className='flex gap-2'>
              <Input
                inputMode='numeric'
                autoComplete='one-time-code'
                placeholder={t('Enter the email code')}
                value={emailOTPCode}
                disabled={!emailOTPChallengeId || isEmailOTPVerifying}
                onChange={(event) => setEmailOTPCode(event.target.value)}
              />
              <Button
                type='button'
                variant='outline'
                disabled={
                  isEmailOTPSending ||
                  isEmailOTPVerifying ||
                  emailOTPCooldown > 0
                }
                onClick={handleSendEmailOTP}
              >
                {isEmailOTPSending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : emailOTPCooldown > 0 ? (
                  t('Resend ({{seconds}}s)', { seconds: emailOTPCooldown })
                ) : (
                  t('Send code')
                )}
              </Button>
            </div>
            <Button
              type='button'
              className='w-full justify-center gap-2'
              disabled={
                !emailOTPChallengeId ||
                isEmailOTPVerifying ||
                (requiresLegalConsent && !agreedToLegal)
              }
              onClick={handleVerifyEmailOTP}
            >
              {isEmailOTPVerifying ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Mail className='h-4 w-4' />
              )}
              {t('Sign in with email code')}
            </Button>
          </div>
        )}

        {activeMethod === 'password' && passwordLoginEnabled && (
          <>
            {/* Username Field */}
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Username or Email')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Enter your username or email')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel>{t('Password')}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('Enter password')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <Link
                    to='/forgot-password'
                    className='text-muted-foreground absolute end-0 -top-0.5 z-10 text-sm font-medium hover:opacity-75'
                  >
                    {t('Forgot password?')}
                  </Link>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type='submit'
              className='mt-2 w-full justify-center gap-2'
              disabled={isLoading || (requiresLegalConsent && !agreedToLegal)}
            >
              {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
              {t('Sign in')}
            </Button>
          </>
        )}

        {(canSwitchToPassword ||
          canSwitchToEmailOTP ||
          hasAlternativeLogin) && (
          <div className='grid gap-2'>
            <div className='text-muted-foreground flex items-center gap-2 text-xs font-medium'>
              <span className='bg-border h-px flex-1' />
              <span>{t('Other methods')}</span>
              <span className='bg-border h-px flex-1' />
            </div>

            {canSwitchToPassword && (
              <Button
                type='button'
                variant='outline'
                className='h-11 w-full justify-center gap-2 rounded-lg'
                onClick={() => setSelectedMethod('password')}
              >
                <KeyRound className='h-4 w-4' />
                {t('Sign in with password')}
              </Button>
            )}

            {canSwitchToEmailOTP && (
              <Button
                type='button'
                variant='outline'
                className='h-11 w-full justify-center gap-2 rounded-lg'
                onClick={() => setSelectedMethod('email_otp')}
              >
                <Mail className='h-4 w-4' />
                {t('Sign in with email code')}
              </Button>
            )}

            {alternativeLoginMethods}
          </div>
        )}

        {isTurnstileEnabled && (
          <div className='mt-2'>
            <Turnstile
              siteKey={turnstileSiteKey}
              onVerify={setTurnstileToken}
            />
          </div>
        )}

        <LegalConsent
          status={status}
          checked={agreedToLegal}
          onCheckedChange={setAgreedToLegal}
          className='mt-1'
        />
      </form>

      {hasWeChatLogin && (
        <Dialog
          open={isWeChatDialogOpen}
          onOpenChange={handleWeChatDialogChange}
        >
          <DialogContent className='max-w-sm'>
            <DialogHeader className='text-left'>
              <DialogTitle>{t('WeChat sign in')}</DialogTitle>
              <DialogDescription>
                {t(
                  'Scan the QR code to follow the official account and reply with “验证码” to receive your verification code.'
                )}
              </DialogDescription>
            </DialogHeader>

            {wechatQrCodeUrl ? (
              <div className='flex justify-center'>
                <img
                  src={wechatQrCodeUrl}
                  alt={t('WeChat login QR code')}
                  className='h-40 w-40 rounded-md border object-contain'
                />
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                {t('QR code is not configured. Please contact support.')}
              </p>
            )}

            <div className='grid gap-2'>
              <Label htmlFor='wechat-code'>{t('Verification code')}</Label>
              <Input
                id='wechat-code'
                placeholder={t('Enter the verification code')}
                value={wechatCode}
                onChange={(event) => setWeChatCode(event.target.value)}
                autoComplete='one-time-code'
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleWeChatDialogChange(false)}
                disabled={isWeChatSubmitting}
              >
                {t('Cancel')}
              </Button>
              <Button
                type='button'
                onClick={handleWeChatLogin}
                disabled={
                  isWeChatSubmitting ||
                  !wechatCode.trim() ||
                  (requiresLegalConsent && !agreedToLegal)
                }
                className='gap-2'
              >
                {isWeChatSubmitting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : null}
                {t('Confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Form>
  )
}
