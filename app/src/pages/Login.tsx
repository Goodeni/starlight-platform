import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, Eye, EyeOff, LogIn, KeyRound, Clock, EyeIcon } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [displayedOtp, setDisplayedOtp] = useState('')

  const loginStep1 = trpc.auth.loginStep1.useMutation({
    onSuccess: (data) => {
      setStep(2)
      setError('')
      if (data.otpCode) setDisplayedOtp(data.otpCode)
      startResendTimer()
    },
    onError: (err) => setError(err.message),
  })

  const loginStep2 = trpc.auth.loginStep2.useMutation({
    onSuccess: () => {
      window.location.href = '/dashboard'
    },
    onError: (err) => setError(err.message),
  })

  function startResendTimer() {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!nickname || !password) {
      setError('Заполните все поля')
      return
    }
    loginStep1.mutate({ nickname, password })
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const code = otpCode.join('')
    if (code.length !== 6) {
      setError('Введите 6-значный код')
      return
    }
    loginStep2.mutate({ nickname, otpCode: code })
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otpCode]
    newOtp[index] = value
    setOtpCode(newOtp)
    setError('')

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-dot-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#059669] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-200">
          {/* Step 1 - Credentials */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-6 h-6 text-[#059669]" />
                </div>
                <h1 className="text-2xl font-black uppercase italic text-gray-900">ВХОД В АККАУНТ</h1>
                <p className="text-sm text-gray-500 mt-1">Введите свои данные для входа</p>
              </div>

              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Никнейм</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => { setNickname(e.target.value); setError('') }}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 transition-all"
                    placeholder="Ваш никнейм"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Пароль</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 transition-all pr-12"
                      placeholder="Ваш пароль"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-[#EF4444]">{error}</p>}

                <button
                  type="submit"
                  disabled={loginStep1.isPending}
                  className="w-full bg-[#10B981] text-[#0A0A0F] font-bold uppercase py-3.5 rounded-full hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  {loginStep1.isPending ? 'Проверка...' : 'ПОЛУЧИТЬ КОД'}
                </button>
              </form>
            </>
          )}

          {/* Step 2 - OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6 text-[#059669]" />
                </div>
                <h1 className="text-2xl font-black uppercase italic text-gray-900">ВВЕДИТЕ КОД</h1>
                <p className="text-sm text-gray-500 mt-1">Мы отправили 6-значный код на ваш email</p>
              </div>

              {/* OTP Display Banner */}
              {displayedOtp && (
                <div className="mb-6 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <EyeIcon className="w-4 h-4 text-[#059669]" />
                    <span className="text-xs font-semibold uppercase text-[#059669]">Ваш код (демо-режим)</span>
                  </div>
                  <div className="text-3xl font-black text-[#059669] tracking-[0.3em]">
                    {displayedOtp}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">В реальном приложении код придет на email</p>
                </div>
              )}

              <form onSubmit={handleStep2} className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-14 sm:w-12 sm:h-14 bg-white border-2 border-gray-300 rounded-xl text-center text-xl font-bold text-gray-900 focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 transition-all"
                    />
                  ))}
                </div>

                {error && <p className="text-sm text-[#EF4444] text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loginStep2.isPending}
                  className="w-full bg-[#10B981] text-[#0A0A0F] font-bold uppercase py-3.5 rounded-full hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  {loginStep2.isPending ? 'Вход...' : 'ВОЙТИ'}
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-400 inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {resendTimer > 0 ? `Новый код через ${resendTimer}с` : 'Код действует 5 минут'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setDisplayedOtp('') }}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Назад к вводу пароля
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-[#059669] hover:text-[#059669] transition-colors">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
