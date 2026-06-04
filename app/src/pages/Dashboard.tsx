import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  User, Package, Calendar, Shield, Settings,
  Edit3, Save, X, ChevronRight, Clock, CheckCircle, AlertTriangle, Mail,
  CalendarDays, MapPin, MessageSquare, Star, UserCircle
} from 'lucide-react'

type Tab = 'profile' | 'packages' | 'schedule' | 'security'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: user?.middleName || '',
    phone: user?.phone || '',
    messengerLink: user?.messengerLink || '',
    age: user?.age || 0,
  })
  // Email verification modal
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyOtp, setVerifyOtp] = useState(['', '', '', '', '', ''])
  const [verifyError, setVerifyError] = useState('')
  const [verifySuccess, setVerifySuccess] = useState(false)
  const [displayedOtp, setDisplayedOtp] = useState('')

  const utils = trpc.useUtils()
  const { data: profile } = trpc.user.getProfile.useQuery()
  const { data: myPackages } = trpc.user.getMyPackages.useQuery()
  const { data: schedule } = trpc.user.getSchedule.useQuery()

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      setEditMode(false)
      window.location.reload()
    },
  })

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => setPwForm({ current: '', new: '', confirm: '' }),
  })

  const requestEmailVerify = trpc.auth.requestEmailVerify.useMutation({
    onSuccess: (data) => {
      if (data.otpCode) setDisplayedOtp(data.otpCode)
      setVerifyError('')
    },
    onError: (err) => setVerifyError(err.message),
  })

  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setVerifySuccess(true)
      setVerifyError('')
      utils.user.getProfile.invalidate()
      setTimeout(() => {
        setShowVerifyModal(false)
        setVerifySuccess(false)
        setDisplayedOtp('')
        setVerifyOtp(['', '', '', '', '', ''])
      }, 2000)
    },
    onError: (err) => setVerifyError(err.message),
  })

  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'packages', label: 'Мои пакеты', icon: Package },
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'security', label: 'Безопасность', icon: Shield },
  ]

  const handleUpdateProfile = () => {
    updateProfile.mutate({
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      middleName: editForm.middleName || undefined,
      phone: editForm.phone,
      messengerLink: editForm.messengerLink || undefined,
      age: editForm.age,
    })
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.new !== pwForm.confirm) { setPwError('Пароли не совпадают'); return }
    changePassword.mutate({ currentPassword: pwForm.current, newPassword: pwForm.new })
  }

  const handleVerifyOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return
    const newOtp = [...verifyOtp]
    newOtp[index] = value
    setVerifyOtp(newOtp)
    setVerifyError('')
    if (value && index < 5) {
      document.getElementById(`votp-${index + 1}`)?.focus()
    }
  }

  const handleVerifyOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verifyOtp[index] && index > 0) {
      document.getElementById(`votp-${index - 1}`)?.focus()
    }
  }

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = verifyOtp.join('')
    if (code.length !== 6) { setVerifyError('Введите 6-значный код'); return }
    if (!user?.email) return
    verifyEmail.mutate({ email: user.email, otpCode: code })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-[88px]">
                <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#059669]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user?.nickname}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#10B981]/10 text-[#059669]'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </nav>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-all mt-4"
                >
                  <Settings className="w-4 h-4" /> Выйти
                </button>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Профиль</h2>
                    {!editMode ? (
                      <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-sm text-[#059669] hover:text-[#059669]">
                        <Edit3 className="w-4 h-4" /> Редактировать
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleUpdateProfile} disabled={updateProfile.isPending} className="flex items-center gap-1.5 text-sm text-[#059669] hover:text-[#059669]">
                          <Save className="w-4 h-4" /> Сохранить
                        </button>
                        <button onClick={() => setEditMode(false)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-600">
                          <X className="w-4 h-4" /> Отмена
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email Status Banner */}
                  <div className={`mb-6 rounded-xl p-4 flex items-center gap-3 ${
                    profile?.emailVerified
                      ? 'bg-[#10B981]/10 border border-[#10B981]/20'
                      : 'bg-[#FFAA00]/10 border border-[#FFAA00]/20'
                  }`}>
                    {profile?.emailVerified ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-[#059669] shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#059669]">Email подтвержден</p>
                          <p className="text-xs text-gray-500">{profile?.email}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-[#FFAA00] shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#FFAA00]">Email не подтвержден</p>
                          <p className="text-xs text-gray-500">{profile?.email}</p>
                        </div>
                        <button
                          onClick={() => { setShowVerifyModal(true); requestEmailVerify.mutate(); }}
                          disabled={requestEmailVerify.isPending}
                          className="shrink-0 text-xs font-bold uppercase bg-[#FFAA00]/20 text-[#FFAA00] px-3 py-1.5 rounded-lg hover:bg-[#FFAA00]/30 transition-colors disabled:opacity-50"
                        >
                          Подтвердить
                        </button>
                      </>
                    )}
                  </div>

                  {profile && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Никнейм', value: profile.nickname, editable: false },
                        { label: 'Email', value: profile.email, editable: false },
                        { label: 'Фамилия', value: profile.lastName, key: 'lastName' as const },
                        { label: 'Имя', value: profile.firstName, key: 'firstName' as const },
                        { label: 'Отчество', value: profile.middleName || '-', key: 'middleName' as const },
                        { label: 'Телефон', value: profile.phone, key: 'phone' as const },
                        { label: 'Возраст', value: String(profile.age), key: 'age' as const },
                        { label: 'Мессенджер', value: profile.messengerLink || '-', key: 'messengerLink' as const },
                      ].map((field) => (
                        <div key={field.label} className="bg-white rounded-xl p-4">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{field.label}</label>
                          {editMode && field.key ? (
                            <input
                              type={field.key === 'age' ? 'number' : 'text'}
                              value={editForm[field.key] || ''}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                [field.key!]: field.key === 'age' ? Number(e.target.value) : e.target.value
                              }))}
                              className="w-full bg-white text-gray-900 text-sm font-medium focus:outline-none border-b border-gray-300 focus:border-[#10B981] pb-1"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{field.value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Packages Tab */}
              {activeTab === 'packages' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Мои пакеты</h2>
                    <Link to="/packages" className="flex items-center gap-1 text-sm text-[#059669] hover:text-[#059669]">
                      Купить новый <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {!myPackages?.length ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400">У вас пока нет купленных пакетов</p>
                      <Link to="/packages" className="inline-block mt-4 text-[#059669] hover:text-[#059669] text-sm">Купить пакет</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myPackages.map((up) => (
                        <div key={up.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-gray-900 font-bold">{up.package.name}</h3>
                            <p className="text-sm text-gray-500">{up.package.price.toLocaleString()} ₽</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            up.status === 'active' ? 'bg-[#10B981]/20 text-[#059669]' :
                            up.status === 'completed' ? 'bg-[#0EA5E9]/20 text-[#0EA5E9]' :
                            'bg-[#EF4444]/20 text-[#EF4444]'
                          }`}>
                            {up.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  {/* Upcoming Stats */}
                  {schedule && schedule.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#059669]" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {schedule.filter(s => s.status === 'scheduled').length}
                            </p>
                            <p className="text-xs text-gray-500">Предстоящих</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-[#0284C7]" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {schedule.filter(s => s.status === 'completed').length}
                            </p>
                            <p className="text-xs text-gray-500">Завершённых</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <CalendarDays className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{schedule.length}</p>
                            <p className="text-xs text-gray-500">Всего занятий</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calendar View */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#059669]" />
                        Календарь занятий
                      </h2>
                    </div>

                    {!schedule?.length ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400">У вас пока нет запланированных тренировок</p>
                        <Link to="/packages" className="inline-block mt-4 text-[#059669] hover:text-[#059669] text-sm font-medium">
                          Купить пакет тренировок
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {schedule.map((s) => {
                          const date = new Date(s.scheduledAt)
                          const isPast = date < new Date()
                          return (
                            <div key={s.id} className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
                              s.status === 'scheduled' && !isPast
                                ? 'border-[#10B981]/30 bg-[#10B981]/5'
                                : s.status === 'completed'
                                ? 'border-gray-200 bg-white'
                                : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-start gap-4">
                                {/* Date block */}
                                <div className="shrink-0 w-14 text-center">
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    {date.toLocaleDateString('ru-RU', { month: 'short' })}
                                  </p>
                                  <p className="text-2xl font-black text-gray-900">{date.getDate()}</p>
                                  <p className="text-xs text-gray-400">
                                    {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                                  </p>
                                </div>

                                {/* Divider */}
                                <div className="w-px bg-gray-200 self-stretch" />

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                                      s.status === 'scheduled' && !isPast
                                        ? 'bg-[#10B981]/20 text-[#059669]'
                                        : s.status === 'completed'
                                        ? 'bg-[#0EA5E9]/10 text-[#0284C7]'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                      {s.status === 'scheduled' && !isPast ? 'Предстоит' : s.status === 'completed' ? 'Завершено' : 'Отменено'}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  {/* Trainer */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <UserCircle className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm font-medium text-gray-900">
                                      Тренер: {s.trainerFirstName} {s.trainerLastName} ({s.trainerNickname})
                                    </p>
                                  </div>

                                  {/* Comment */}
                                  {s.trainerComment && (
                                    <div className="flex items-start gap-2 bg-white rounded-lg p-2 border border-gray-100">
                                      <MessageSquare className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Комментарий тренера</p>
                                        <p className="text-sm text-gray-700">{s.trainerComment}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Rating */}
                                  {s.rating && (
                                    <div className="flex items-center gap-1 mt-2">
                                      {[1, 2, 3, 4, 5].map(r => (
                                        <Star
                                          key={r}
                                          className={`w-4 h-4 ${r <= s.rating! ? 'text-[#FFAA00] fill-[#FFAA00]' : 'text-gray-300'}`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Смена пароля</h2>

                  <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Текущий пароль</label>
                      <input
                        type="password"
                        value={pwForm.current}
                        onChange={(e) => setPwForm(prev => ({ ...prev, current: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-[#10B981] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Новый пароль</label>
                      <input
                        type="password"
                        value={pwForm.new}
                        onChange={(e) => setPwForm(prev => ({ ...prev, new: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-[#10B981] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Подтвердите пароль</label>
                      <input
                        type="password"
                        value={pwForm.confirm}
                        onChange={(e) => setPwForm(prev => ({ ...prev, confirm: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-[#10B981] focus:outline-none transition-all"
                      />
                    </div>
                    {pwError && <p className="text-sm text-[#EF4444]">{pwError}</p>}
                    {changePassword.isSuccess && <p className="text-sm text-[#059669]">Пароль изменен!</p>}
                    <button
                      type="submit"
                      disabled={changePassword.isPending}
                      className="bg-[#10B981] text-[#0A0A0F] font-bold uppercase py-3 px-8 rounded-full hover:bg-[#059669] transition-all active:scale-[0.97] disabled:opacity-50 text-sm"
                    >
                      {changePassword.isPending ? 'Сохранение...' : 'Изменить пароль'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Email Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 w-full max-w-md">
            {verifySuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#059669]" />
                </div>
                <h2 className="text-xl font-black uppercase italic text-gray-900 mb-2">EMAIL ПОДТВЕРЖДЕН!</h2>
                <p className="text-gray-500 text-sm">Окно закроется автоматически</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#059669]" /> Подтверждение Email
                  </h2>
                  <button onClick={() => setShowVerifyModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Введите 6-значный код для подтверждения <span className="text-[#059669]">{user?.email}</span>
                </p>

                {/* OTP Display */}
                {displayedOtp && (
                  <div className="mb-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-3 text-center">
                    <p className="text-xs font-semibold uppercase text-[#059669] mb-1">Ваш код (демо)</p>
                    <p className="text-2xl font-black text-[#059669] tracking-[0.3em]">{displayedOtp}</p>
                  </div>
                )}

                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {verifyOtp.map((digit, i) => (
                      <input
                        key={i}
                        id={`votp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleVerifyOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleVerifyOtpKeyDown(i, e)}
                        className="w-10 h-12 bg-white border-2 border-gray-300 rounded-xl text-center text-lg font-bold text-gray-900 focus:border-[#10B981] focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  {verifyError && <p className="text-sm text-[#EF4444] text-center">{verifyError}</p>}

                  <button
                    type="submit"
                    disabled={verifyEmail.isPending}
                    className="w-full bg-[#10B981] text-[#0A0A0F] font-bold uppercase py-3 rounded-full hover:bg-[#059669] transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    {verifyEmail.isPending ? 'Проверка...' : 'ПОДТВЕРДИТЬ'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
