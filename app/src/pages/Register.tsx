import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    nickname: '',
    email: '',
    phone: '',
    age: '',
    password: '',
    messengerLink: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')

  const register = trpc.auth.register.useMutation({
    onSuccess: () => {
      navigate('/login')
    },
    onError: (err) => {
      const msg = err.message.toLowerCase()
      if (msg.includes('никнейм') || msg.includes('nickname') || msg.includes('ник')) {
        setErrors(prev => ({ ...prev, nickname: err.message }))
      } else if (msg.includes('email') || msg.includes('почт')) {
        setErrors(prev => ({ ...prev, email: err.message }))
      } else if (msg.includes('телефон') || msg.includes('phone') || msg.includes('номер')) {
        setErrors(prev => ({ ...prev, phone: err.message }))
      } else {
        setGeneralError(err.message)
      }
    },
  })

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
    setGeneralError('')
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.firstName.trim()) newErrors.firstName = 'Введите имя'
    if (!form.lastName.trim()) newErrors.lastName = 'Введите фамилию'
    if (!form.nickname.trim()) newErrors.nickname = 'Введите никнейм'
    else if (form.nickname.length < 3) newErrors.nickname = 'Минимум 3 символа'
    if (!form.email.trim()) newErrors.email = 'Введите email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Неверный email'
    if (!form.phone.trim()) newErrors.phone = 'Введите номер телефона'
    if (!form.age) newErrors.age = 'Введите возраст'
    else {
      const ageNum = parseInt(form.age)
      if (isNaN(ageNum) || ageNum < 12 || ageNum > 99) newErrors.age = 'Возраст от 12 до 99'
    }
    if (!form.password) newErrors.password = 'Введите пароль'
    else {
      if (form.password.length < 8) newErrors.password = 'Минимум 8 символов'
      else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Добавьте заглавную букву'
      else if (!/[a-z]/.test(form.password)) newErrors.password = 'Добавьте строчную букву'
      else if (!/[0-9]/.test(form.password)) newErrors.password = 'Добавьте цифру'

    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    register.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName || undefined,
      nickname: form.nickname,
      email: form.email,
      phone: form.phone,
      age: parseInt(form.age),
      password: form.password,
      messengerLink: form.messengerLink || undefined,
    })
  }

  const inputClass = (field: string) =>
    `w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
      errors[field]
        ? 'border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]/30'
        : 'border-gray-300 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30'
    }`

  return (
    <div className="min-h-screen bg-gray-50 bg-dot-pattern flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#059669] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-[#059669]" />
            </div>
            <h1 className="text-2xl font-black uppercase italic text-gray-900">СОЗДАТЬ АККАУНТ</h1>
            <p className="text-sm text-gray-500 mt-1">Заполните все поля для регистрации</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Фамилия *</label>
                <input type="text" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={inputClass('lastName')} placeholder="Фамилия" />
                {errors.lastName && <p className="text-xs text-[#EF4444] mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Имя *</label>
                <input type="text" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={inputClass('firstName')} placeholder="Имя" />
                {errors.firstName && <p className="text-xs text-[#EF4444] mt-1">{errors.firstName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Отчество</label>
              <input type="text" value={form.middleName} onChange={(e) => updateField('middleName', e.target.value)} className={inputClass('middleName')} placeholder="Отчество (необязательно)" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Никнейм *</label>
              <input type="text" value={form.nickname} onChange={(e) => updateField('nickname', e.target.value)} className={inputClass('nickname')} placeholder="Ваш игровой никнейм" />
              {errors.nickname && <p className="text-xs text-[#EF4444] mt-1">{errors.nickname}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Email *</label>
                <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass('email')} placeholder="email@example.com" />
                {errors.email && <p className="text-xs text-[#EF4444] mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Телефон *</label>
                <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className={inputClass('phone')} placeholder="+7 (999) 000-00-00" />
                {errors.phone && <p className="text-xs text-[#EF4444] mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Возраст *</label>
                <input type="number" value={form.age} onChange={(e) => updateField('age', e.target.value)} className={inputClass('age')} placeholder="18" min={12} max={99} />
                {errors.age && <p className="text-xs text-[#EF4444] mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Мессенджер</label>
                <input type="text" value={form.messengerLink} onChange={(e) => updateField('messengerLink', e.target.value)} className={inputClass('messengerLink')} placeholder="@username в Telegram" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Пароль *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className={`${inputClass('password')} pr-12`}
                  placeholder="Мин. 8 символов"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#EF4444] mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-400 mt-1">Мин. 8 символов, заглавная, строчная, цифра</p>
            </div>

            {generalError && <p className="text-sm text-[#EF4444]">{generalError}</p>}

            <button
              type="submit"
              disabled={register.isPending}
              className="w-full bg-[#10B981] text-white font-bold uppercase py-3.5 rounded-full hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {register.isPending ? 'Регистрация...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Уже есть аккаунт? <Link to="/login" className="text-[#059669] hover:text-[#059669]">Войти</Link>
        </p>
      </div>
    </div>
  )
}
