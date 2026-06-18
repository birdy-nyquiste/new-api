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
import { useEffect, useState } from 'react'
import { Loader2, Mail, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Turnstile } from '@/components/turnstile'
import { sendEmailOTP, verifyEmailOTP } from '@/features/auth/api'
import { LegalConsent } from '@/features/auth/components/legal-consent'
import { useAuthRedirect } from '@/features/auth/hooks/use-auth-redirect'
import { useTurnstile } from '@/features/auth/hooks/use-turnstile'
import {
  getAffiliateCode,
  saveAffiliateCode,
} from '@/features/auth/lib/storage'

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SignUpForm({
  className,
  redirectTo,
  ...props
}: SignUpFormProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { handleLoginSuccess } = useAuthRedirect()
  const {
    isTurnstileEnabled,
    turnstileSiteKey,
    turnstileToken,
    setTurnstileToken,
    validateTurnstile,
  } = useTurnstile()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [agreedToLegal, setAgreedToLegal] = useState(false)

  const hasUserAgreement = Boolean(status?.user_agreement_enabled)
  const hasPrivacyPolicy = Boolean(status?.privacy_policy_enabled)
  const requiresLegalConsent = hasUserAgreement || hasPrivacyPolicy
  const emailOTPRegisterEnabled = Boolean(
    status?.email_otp_register_enabled ??
    status?.data?.email_otp_register_enabled
  )
  const registerEnabled =
    (status?.register_enabled ?? status?.data?.register_enabled ?? true) !==
    false
  const smtpConfigured = Boolean(
    status?.smtp_configured ?? status?.data?.smtp_configured
  )
  const cooldownSeconds = Number(
    status?.email_otp_resend_cooldown ??
      status?.data?.email_otp_resend_cooldown ??
      60
  )
  const canUseOTP = registerEnabled && emailOTPRegisterEnabled && smtpConfigured
  const turnstileReady = !isTurnstileEnabled || Boolean(turnstileToken)

  useEffect(() => {
    if (requiresLegalConsent) {
      setAgreedToLegal(false)
    } else {
      setAgreedToLegal(true)
    }
  }, [requiresLegalConsent])

  useEffect(() => {
    const aff = new URLSearchParams(window.location.search).get('aff')?.trim()
    if (aff) {
      saveAffiliateCode(aff)
    }
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  async function handleSendCode() {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(t('Please agree to the legal terms first'))
      return
    }
    if (!email.trim()) {
      toast.error(t('Please enter your email'))
      return
    }
    if (!validateTurnstile()) return

    setIsSendingCode(true)
    try {
      const res = await sendEmailOTP({
        email: email.trim(),
        purpose: 'register',
        turnstile: turnstileToken,
      })
      if (res.success) {
        const nextChallengeId =
          typeof res.data?.challenge_id === 'string'
            ? res.data.challenge_id
            : ''
        setChallengeId(nextChallengeId)
        setSecondsLeft(cooldownSeconds)
        toast.success(
          t(
            'A verification code will arrive shortly if this email is eligible.'
          )
        )
      } else {
        toast.error(res.message || t('Failed to send code'))
      }
    } catch (_error) {
      toast.error(t('Failed to send code'))
    } finally {
      setIsSendingCode(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(t('Please agree to the legal terms first'))
      return
    }
    if (!email.trim() || !code.trim() || !challengeId) {
      toast.error(t('Please enter email and verification code'))
      return
    }

    setIsVerifying(true)
    try {
      const res = await verifyEmailOTP({
        email: email.trim(),
        purpose: 'register',
        challenge_id: challengeId,
        code: code.trim(),
        aff_code: getAffiliateCode(),
      })
      if (res.success) {
        await handleLoginSuccess(res.data as { id?: number } | null, redirectTo)
        toast.success(t('Account created'))
      } else {
        toast.error(res.message || t('Failed to create account'))
      }
    } catch (_error) {
      toast.error(t('Failed to create account'))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('grid gap-4', className)}
      {...props}
    >
      {!canUseOTP && (
        <div className='border-border bg-muted/40 rounded-md border px-3 py-2 text-sm'>
          {t('Email code registration is not available right now.')}
        </div>
      )}

      <div className='grid gap-2'>
        <Label htmlFor='signup-email'>{t('Email')}</Label>
        <Input
          id='signup-email'
          type='email'
          autoComplete='email'
          placeholder={t('name@example.com')}
          value={email}
          disabled={!canUseOTP || isSendingCode || isVerifying}
          onChange={(event) => {
            setEmail(event.target.value)
            setChallengeId('')
            setCode('')
          }}
        />
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='signup-code'>{t('Verification code')}</Label>
        <div className='flex gap-2'>
          <Input
            id='signup-code'
            inputMode='numeric'
            autoComplete='one-time-code'
            placeholder={t('Enter the email code')}
            value={code}
            disabled={!challengeId || isVerifying}
            onChange={(event) => setCode(event.target.value)}
          />
          <Button
            type='button'
            variant='outline'
            disabled={
              !canUseOTP ||
              !turnstileReady ||
              isSendingCode ||
              isVerifying ||
              secondsLeft > 0
            }
            onClick={handleSendCode}
          >
            {isSendingCode ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : secondsLeft > 0 ? (
              t('Resend ({{seconds}}s)', { seconds: secondsLeft })
            ) : (
              t('Send code')
            )}
          </Button>
        </div>
      </div>

      {isTurnstileEnabled && (
        <Turnstile siteKey={turnstileSiteKey} onVerify={setTurnstileToken} />
      )}

      <LegalConsent
        status={status}
        checked={agreedToLegal}
        onCheckedChange={setAgreedToLegal}
        className='mt-1'
      />

      <Button
        type='submit'
        className='mt-2 w-full justify-center gap-2'
        disabled={
          !canUseOTP ||
          !challengeId ||
          isVerifying ||
          (requiresLegalConsent && !agreedToLegal)
        }
      >
        {isVerifying ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <ShieldCheck className='h-4 w-4' />
        )}
        {t('Create account')}
      </Button>

      <p className='text-muted-foreground flex items-start gap-2 text-xs'>
        <Mail className='mt-0.5 h-3.5 w-3.5 shrink-0' />
        <span>
          {t('You will sign in with email codes. No password is needed.')}
        </span>
      </p>
    </form>
  )
}
