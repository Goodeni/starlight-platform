import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, Mail, CheckCircle, Clock, Eye } from 'lucide-react'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''
  const initialOtp = location.state?.otpCode || ''
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [displayedOtp, setDisplayedOtp] = useState<string>(initialOtp)

  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setSuccess(true)
      setError('')
      setTimeout(() => navigate('/login'), 3000)
    },
    onError: (err) => setError(err.message),
  })

  const resendOtp = trpc.auth.resendOtp.useMutation({
    onSuccess: (data) => {
      setError('')
      if (data.otpCode) setDisplayedOtp(data.otpCode)
      startResendTimer()
    },
    onError: (err) => setError(err.message),
  })

  function startResendTimer() {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otpCode]
    newOtp[index] = value
    setOtpCode(newOtp)
    setError('')
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = otpCode.join('')
    if (code.length !== 6) { setError('Введите 6-значный код'); return }
    if (!email) { setError('Email не указан. Вернитесь к регистрации.'); return }
    verifyEmail.mutate({ email, otpCode: code })
  }

  const handleResend = () => {
    if (resendTimer > 0 || !email) return
    resendOtp.mutate({ email, purpose: 'email_verify' })
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 bg-dot-pattern flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Email не указан. Пожалуйста, зарегистрируйтесь.</p>
          <Link to="/register" className="text-[#059669] hover:text-[#059669]">Перейти к регистрации</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-dot-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/register" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#059669] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-200">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#059669]" />
              </div>
              <h2 className="text-2xl font-black uppercase italic text-gray-900 mb-2">EMAIL ПОДТВЕРЖДЕН!</h2>
              <p className="text-gray-500 text-sm">Перенаправление на страницу входа...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-[#059669]" />
                </div>
                <h1 className="text-2xl font-black uppercase italic text-gray-900">ПОДТВЕРДИТЕ EMAIL</h1>
                <p className="text-sm text-gray-500 mt-1">Введите 6-значный код, отправленный на <span className="text-[#059669]">{email}</span></p>
              </div>

              {/* OTP Display Banner */}
              {displayedOtp && (
                <div className="mb-6 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-[#059669]" />
                    <span className="text-xs font-semibold uppercase text-[#059669]">Ваш код (демо-режим)</span>
                  </div>
                  <div className="text-3xl font-black text-[#059669] tracking-[0.3em]">
                    {displayedOtp}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">В реальном приложении код придет на email</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={verifyEmail.isPending}
                  className="w-full bg-[#10B981] text-[#0A0A0F] font-bold uppercase py-3.5 rounded-full hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  {verifyEmail.isPending ? 'Проверка...' : 'ПОДТВЕРДИТЬ'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className="text-sm text-[#059669] hover:text-[#059669] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    {resendTimer > 0 ? `Отправить повторно через ${resendTimer}` : 'Отправить код повторно'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
