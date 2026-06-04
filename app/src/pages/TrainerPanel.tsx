import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Users, CalendarPlus, MessageSquare, Star, Loader2,
  CheckCircle, Clock, X, Trash2, Edit3, TrendingUp, BookOpen,
  ChevronDown, CalendarDays
} from 'lucide-react'

type Tab = 'students' | 'schedule' | 'comments'

export default function TrainerPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('students')
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [sessionForm, setSessionForm] = useState({
    scheduledAt: '',
    comment: '',
  })
  const [commentForm, setCommentForm] = useState({
    sessionId: '',
    comment: '',
    rating: 5,
  })
  const [editingSession, setEditingSession] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ scheduledAt: '', comment: '' })

  const { data: students } = trpc.trainer.getAllStudents.useQuery()
  const { data: myStudents } = trpc.trainer.getStudents.useQuery()
  const { data: sessions } = trpc.trainer.getMySessions.useQuery()
  const { data: stats } = trpc.trainer.getStats.useQuery()
  const { data: allUsers } = trpc.trainer.getAvailableUsers.useQuery()
  const utils = trpc.useUtils()

  const createSession = trpc.trainer.createSession.useMutation({
    onSuccess: () => {
      utils.trainer.getMySessions.invalidate()
      utils.trainer.getStats.invalidate()
      setSessionForm({ scheduledAt: '', comment: '' })
      setSelectedStudent(null)
      setSelectedPackage(null)
    },
  })

  const addComment = trpc.trainer.addComment.useMutation({
    onSuccess: () => {
      utils.trainer.getMySessions.invalidate()
      setCommentForm({ sessionId: '', comment: '', rating: 5 })
    },
  })

  const updateSession = trpc.trainer.updateSession.useMutation({
    onSuccess: () => {
      utils.trainer.getMySessions.invalidate()
      setEditingSession(null)
    },
  })

  const deleteSession = trpc.trainer.deleteSession.useMutation({
    onSuccess: () => {
      utils.trainer.getMySessions.invalidate()
      utils.trainer.getStats.invalidate()
    },
  })

  const assignToPackage = trpc.trainer.assignToPackage.useMutation({
    onSuccess: () => {
      utils.trainer.getStudents.invalidate()
      utils.trainer.getAllStudents.invalidate()
    },
  })

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'students', label: 'Все ученики', icon: Users },
    { id: 'schedule', label: 'Моё расписание', icon: CalendarDays },
    { id: 'comments', label: 'Комментарии', icon: MessageSquare },
  ]

  const selectedStudentData = allUsers?.find(u => u.id === selectedStudent)
  const mySessions = sessions || []
  const allStudents = students || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black uppercase italic text-gray-900 mb-2">
              ПАНЕЛЬ <span className="text-gradient-green">ТРЕНЕРА</span>
            </h1>
            <p className="text-gray-500 text-sm">Управление учениками, занятиями и комментариями</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#059669]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                  <p className="text-xs text-gray-500">Всего учеников</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#0284C7]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.upcomingSessions || 0}</p>
                  <p className="text-xs text-gray-500">Предстоящих занятий</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#059669]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completedSessions || 0}</p>
                  <p className="text-xs text-gray-500">Завершённых занятий</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
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
              </div>

              {/* Quick Actions */}
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Быстрое действие</h3>
                <button
                  onClick={() => setActiveTab('comments')}
                  className="w-full bg-[#10B981] text-white font-bold uppercase py-2.5 px-4 rounded-xl hover:bg-[#059669] transition-all text-xs flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Назначить занятие
                </button>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1">
              {/* ALL STUDENTS */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  {/* All Students Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Все ученики с курсами</h2>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
                        {allStudents.length} учеников
                      </span>
                    </div>
                    {!allStudents.length ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400">Пока нет учеников с купленными курсами</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-gray-400">Ученик</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-gray-400">Контакты</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-gray-400">Курс</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-gray-400">Статус</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-gray-400">Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allStudents.map((s, i) => (
                              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#059669] font-bold text-xs">
                                      {s.firstName?.[0]}{s.lastName?.[0]}
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-900 font-medium">{s.nickname}</p>
                                      <p className="text-xs text-gray-500">{s.firstName} {s.lastName}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">{s.email}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{s.packageName}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                                    s.packageStatus === 'active' ? 'bg-[#10B981]/10 text-[#059669]' : 
                                    s.packageStatus === 'completed' ? 'bg-[#0EA5E9]/10 text-[#0284C7]' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {s.packageStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(s.id)
                                      setSelectedPackage(s.packageId)
                                      setActiveTab('comments')
                                    }}
                                    className="text-xs bg-[#10B981]/10 text-[#059669] px-3 py-1.5 rounded-lg font-semibold hover:bg-[#10B981]/20 transition-all"
                                  >
                                    Назначить
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* My Assigned Students */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Мои ученики</h2>
                    {!myStudents?.length ? (
                      <p className="text-gray-400 text-center py-8">У вас пока нет назначенных учеников</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myStudents.map((s, i) => (
                          <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#059669] font-bold text-sm">
                                {s.firstName?.[0]}{s.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{s.nickname}</p>
                                <p className="text-xs text-gray-500">{s.firstName} {s.lastName}</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{s.email}</p>
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                              s.packageStatus === 'active' ? 'bg-[#10B981]/10 text-[#059669]' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {s.packageStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Моё расписание</h2>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
                      {mySessions.length} занятий
                    </span>
                  </div>
                  {!mySessions.length ? (
                    <div className="text-center py-12">
                      <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400">Нет запланированных занятий</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mySessions.map((s) => (
                        <div key={s.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                s.status === 'scheduled' ? 'bg-[#10B981]/10' :
                                s.status === 'completed' ? 'bg-[#0EA5E9]/10' : 'bg-red-100'
                              }`}>
                                {s.status === 'scheduled' ? <Clock className="w-5 h-5 text-[#059669]" /> :
                                 s.status === 'completed' ? <CheckCircle className="w-5 h-5 text-[#0284C7]" /> :
                                 <X className="w-5 h-5 text-red-500" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">
                                  {new Date(s.scheduledAt).toLocaleDateString('ru-RU', {
                                    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                                  })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(s.scheduledAt).toLocaleTimeString('ru-RU', {
                                    hour: '2-digit', minute: '2-digit'
                                  })} — {s.userNickname}
                                </p>
                                {s.trainerComment && (
                                  <p className="text-xs text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded">
                                    {s.trainerComment}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingSession(s.id)
                                  setEditForm({
                                    scheduledAt: new Date(s.scheduledAt).toISOString().slice(0, 16),
                                    comment: s.trainerComment || ''
                                  })
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                                title="Редактировать"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Удалить занятие?')) {
                                    deleteSession.mutate({ sessionId: s.id })
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Inline Edit */}
                          {editingSession === s.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Дата и время</label>
                                  <input
                                    type="datetime-local"
                                    value={editForm.scheduledAt}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-[#10B981] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Комментарий</label>
                                  <input
                                    type="text"
                                    value={editForm.comment}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-[#10B981] focus:outline-none"
                                    placeholder="Комментарий..."
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => {
                                    updateSession.mutate({
                                      sessionId: s.id,
                                      scheduledAt: new Date(editForm.scheduledAt).toISOString(),
                                      comment: editForm.comment,
                                    })
                                  }}
                                  className="bg-[#10B981] text-white text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-[#059669] transition-all"
                                >
                                  Сохранить
                                </button>
                                <button
                                  onClick={() => setEditingSession(null)}
                                  className="bg-gray-100 text-gray-600 text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
                                >
                                  Отмена
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COMMENTS / CREATE SESSION */}
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  {/* Create Session */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <CalendarPlus className="w-5 h-5 text-[#059669]" />
                      Назначить занятие
                    </h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (!selectedStudent || !selectedPackage) return
                        createSession.mutate({
                          userId: selectedStudent,
                          userPackageId: selectedPackage,
                          scheduledAt: new Date(sessionForm.scheduledAt).toISOString(),
                          comment: sessionForm.comment || undefined,
                        })
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Student Select */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Ученик
                          </label>
                          <select
                            value={selectedStudent || ''}
                            onChange={(e) => {
                              const uid = Number(e.target.value)
                              setSelectedStudent(uid)
                              const student = allStudents.find(s => s.id === uid)
                              if (student) setSelectedPackage(student.packageId)
                            }}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-[#10B981] focus:outline-none transition-all text-sm"
                            required
                          >
                            <option value="">Выберите ученика</option>
                            {allStudents.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nickname} ({s.firstName} {s.lastName}) — {s.packageName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* DateTime */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Дата и время
                          </label>
                          <input
                            type="datetime-local"
                            value={sessionForm.scheduledAt}
                            onChange={(e) => setSessionForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-[#10B981] focus:outline-none transition-all text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                          Комментарий к занятию
                        </label>
                        <textarea
                          value={sessionForm.comment}
                          onChange={(e) => setSessionForm(prev => ({ ...prev, comment: e.target.value }))}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-[#10B981] focus:outline-none transition-all h-20 resize-none text-sm"
                          placeholder="Тема занятия, заметки..."
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={createSession.isPending || !selectedStudent}
                          className="bg-[#10B981] text-white font-bold uppercase py-3 px-8 rounded-full hover:bg-[#059669] transition-all active:scale-[0.97] disabled:opacity-50 text-sm"
                        >
                          {createSession.isPending ? 'Создание...' : 'Назначить занятие'}
                        </button>
                        {createSession.isSuccess && (
                          <span className="text-sm text-[#059669] font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Занятие создано!
                          </span>
                        )}
                      </div>
                      {createSession.error && <p className="text-sm text-[#EF4444]">{createSession.error.message}</p>}
                    </form>
                  </div>

                  {/* Quick Comment on Existing Sessions */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#059669]" />
                      Добавить комментарий к занятию
                    </h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (!commentForm.sessionId) return
                        addComment.mutate({
                          sessionId: Number(commentForm.sessionId),
                          comment: commentForm.comment,
                          rating: commentForm.rating,
                        })
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Занятие
                          </label>
                          <select
                            value={commentForm.sessionId}
                            onChange={(e) => setCommentForm(prev => ({ ...prev, sessionId: e.target.value }))}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-[#10B981] focus:outline-none transition-all text-sm"
                            required
                          >
                            <option value="">Выберите занятие</option>
                            {mySessions.map((s) => (
                              <option key={s.id} value={s.id}>
                                {new Date(s.scheduledAt).toLocaleDateString('ru-RU')} — {s.userNickname} ({s.status})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Оценка
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setCommentForm(prev => ({ ...prev, rating: r }))}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                  commentForm.rating >= r ? 'bg-[#10B981]/20 text-[#059669]' : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                <Star className="w-5 h-5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                          Комментарий
                        </label>
                        <textarea
                          value={commentForm.comment}
                          onChange={(e) => setCommentForm(prev => ({ ...prev, comment: e.target.value }))}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-[#10B981] focus:outline-none transition-all h-20 resize-none text-sm"
                          required
                          placeholder="Опишите результаты занятия..."
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={addComment.isPending}
                          className="bg-gray-900 text-white font-bold uppercase py-3 px-8 rounded-full hover:bg-gray-800 transition-all active:scale-[0.97] disabled:opacity-50 text-sm"
                        >
                          {addComment.isPending ? 'Сохранение...' : 'Добавить комментарий'}
                        </button>
                        {addComment.isSuccess && (
                          <span className="text-sm text-[#059669] font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Комментарий добавлен!
                          </span>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
