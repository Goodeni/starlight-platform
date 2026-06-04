import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Users, Shield, FileDown, BarChart3, Search, Loader2,
  ChevronDown, Download, AlertTriangle, CheckCircle
} from 'lucide-react'

type Tab = 'users' | 'logs' | 'backup' | 'audit'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [newRole, setNewRole] = useState<'user' | 'trainer' | 'admin'>('user')

  const { data: stats } = trpc.admin.getStats.useQuery()
  const { data: usersData, refetch: refetchUsers } = trpc.admin.getUsers.useQuery(
    { page: 1, limit: 50, search: searchQuery || undefined, role: roleFilter !== 'all' ? roleFilter as 'user' | 'trainer' | 'admin' : undefined }
  )
  const { data: logsData } = trpc.admin.getSecurityLogs.useQuery({ page: 1, limit: 100 })
  const { data: securityStatus } = trpc.security.getStatus.useQuery()

  const utils = trpc.useUtils()

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { refetchUsers(); setSelectedUserId(null) },
  })

  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => refetchUsers(),
  })

  const createBackup = trpc.admin.createBackup.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.backup], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename
      a.click()
      URL.revokeObjectURL(url)
    },
  })

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'logs', label: 'Журнал безопасности', icon: Shield },
    { id: 'backup', label: 'Резервное копирование', icon: FileDown },
    { id: 'audit', label: 'Аудит безопасности', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black uppercase italic text-gray-900 mb-8">
            АДМИН <span className="text-gradient-green">ПАНЕЛЬ</span>
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Пользователи', value: stats?.totalUsers || 0, color: 'text-[#059669]' },
              { label: 'Тренеры', value: stats?.totalTrainers || 0, color: 'text-[#0EA5E9]' },
              { label: 'Сессии', value: stats?.totalSessions || 0, color: 'text-[#FFAA00]' },
              { label: 'Пакеты', value: stats?.totalPackages || 0, color: 'text-[#EF4444]' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 border border-gray-200">
                <p className="text-xs font-semibold uppercase text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
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
            </aside>

            {/* Content */}
            <div className="flex-1">
              {/* Users */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск по никнейму..."
                        className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 text-sm focus:border-[#10B981] focus:outline-none transition-all"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-[#10B981] focus:outline-none"
                    >
                      <option value="all">Все роли</option>
                      <option value="user">User</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {!usersData?.users.length ? (
                    <p className="text-gray-400 text-center py-8">Пользователи не найдены</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">ID</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">Никнейм</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">Email</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">Роль</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">Email вериф.</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersData.users.map((u) => (
                            <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                              <td className="py-3 px-3 text-sm text-gray-500">{u.id}</td>
                              <td className="py-3 px-3 text-sm text-gray-900 font-medium">{u.nickname}</td>
                              <td className="py-3 px-3 text-sm text-gray-500">{u.email}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                  u.role === 'admin' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                                  u.role === 'trainer' ? 'bg-[#0EA5E9]/20 text-[#0EA5E9]' :
                                  'bg-white/10 text-gray-500'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                {u.emailVerified ? (
                                  <CheckCircle className="w-4 h-4 text-[#059669]" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-[#FFAA00]" />
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  {selectedUserId === u.id ? (
                                    <>
                                      <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value as 'user' | 'trainer' | 'admin')}
                                        className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-900"
                                      >
                                        <option value="user">user</option>
                                        <option value="trainer">trainer</option>
                                        <option value="admin">admin</option>
                                      </select>
                                      <button
                                        onClick={() => updateRole.mutate({ userId: u.id, role: newRole })}
                                        disabled={updateRole.isPending}
                                        className="text-xs text-[#059669] hover:text-[#059669] font-semibold"
                                      >
                                        OK
                                      </button>
                                      <button
                                        onClick={() => setSelectedUserId(null)}
                                        className="text-xs text-gray-400 hover:text-gray-600"
                                      >
                                        Отмена
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => { setSelectedUserId(u.id); setNewRole(u.role as 'user' | 'trainer' | 'admin') }}
                                        className="text-xs text-[#059669] hover:text-[#059669] font-semibold"
                                      >
                                        Роль
                                      </button>
                                      <button
                                        onClick={() => { if (confirm('Удалить пользователя?')) deleteUser.mutate({ userId: u.id }) }}
                                        className="text-xs text-[#EF4444] hover:text-[#FF5577] font-semibold"
                                      >
                                        Удалить
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Security Logs */}
              {activeTab === 'logs' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Журнал безопасности</h2>
                  {!logsData?.logs.length ? (
                    <p className="text-gray-400 text-center py-8">Нет записей</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">Время</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">Событие</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">IP</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-gray-400">Детали</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logsData.logs.map((log, i) => (
                            <tr key={i} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                              <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString('ru-RU')}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                  log.eventType.includes('failed') || log.eventType.includes('delete') ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                                  log.eventType.includes('success') || log.eventType.includes('verified') ? 'bg-[#10B981]/20 text-[#059669]' :
                                  'bg-white/10 text-gray-500'
                                }`}>
                                  {log.eventType}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-xs text-gray-400">{log.ipAddress || '-'}</td>
                              <td className="py-3 px-3 text-xs text-gray-400 max-w-xs truncate">
                                {log.details ? JSON.stringify(log.details) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Backup */}
              {activeTab === 'backup' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Резервное копирование</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Создайте полную резервную копию базы данных в формате JSON. 
                    Файл будет автоматически загружен на ваше устройство.
                  </p>
                  <button
                    onClick={() => createBackup.mutate()}
                    disabled={createBackup.isPending}
                    className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0A0F] font-bold uppercase py-3 px-8 rounded-full hover:bg-[#059669] transition-all active:scale-[0.97] disabled:opacity-50 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    {createBackup.isPending ? 'Создание...' : 'Создать бэкап'}
                  </button>
                  {createBackup.isSuccess && (
                    <p className="text-sm text-[#059669] mt-4">Бэкап успешно создан и загружен!</p>
                  )}
                </div>
              )}

              {/* Security Audit */}
              {activeTab === 'audit' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Аудит безопасности</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'HTTPS', status: securityStatus?.https, desc: 'SSL-сертификат активен' },
                      { label: 'WAF (Web Application Firewall)', status: securityStatus?.waf, desc: 'Фильтрация вредоносного трафика' },
                      { label: 'Политика паролей', status: securityStatus?.passwordPolicy, desc: 'Минимум 8 символов, сложность' },
                      { label: 'Двухфакторная аутентификация', status: securityStatus?.twoFactor, desc: 'OTP код при входе' },
                      { label: 'Rate Limiting', status: securityStatus?.rateLimiting, desc: '5 запросов в минуту на IP' },
                      { label: 'Security Headers', status: true, desc: 'X-Frame-Options, CSP, HSTS и др.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          item.status ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'
                        }`}>
                          {item.status ? <CheckCircle className="w-5 h-5 text-[#059669]" /> : <AlertTriangle className="w-5 h-5 text-[#EF4444]" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                          item.status ? 'bg-[#10B981]/20 text-[#059669]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                        }`}>
                          {item.status ? 'АКТИВЕН' : 'ОТКЛЮЧЕН'}
                        </span>
                      </div>
                    ))}
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
