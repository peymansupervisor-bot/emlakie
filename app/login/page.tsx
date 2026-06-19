'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    setError('')
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit US phone number.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+1${digits}`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.')
      return
    }
    setLoading(true)
    const digits = phone.replace(/\D/g, '')
    const { error } = await supabase.auth.verifyOtp({
      phone: `+1${digits}`,
      token: code,
      type: 'sms',
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {step === 'phone' ? (
          <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Sign in</h1>
            <p className="text-gray-500 text-sm mb-6">Enter your cell phone number to receive a verification code.</p>
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-600 focus-within:border-green-600">
                  <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300" aria-hidden="true">+1</span>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 000-0000"
                    maxLength={14}
                    aria-label="US phone number"
                    className="flex-1 px-3 py-3 text-sm outline-none"
                    autoFocus
                  />
                </div>
              </div>
              {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send verification code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Enter code</h1>
            <p className="text-gray-500 text-sm mb-6">
              We sent a 6-digit code to <span className="font-medium text-gray-700">{phone}</span>.
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
                <input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-center tracking-widest text-lg outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
                  autoFocus
                />
              </div>
              {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & sign in'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setCode(''); setError('') }}
                className="w-full text-gray-500 text-sm hover:text-gray-700"
              >
                Use a different number
              </button>
            </form>
          </>
        )}

        <p className="text-xs text-gray-600 text-center mt-6">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-gray-800">Terms</a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-gray-800">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
