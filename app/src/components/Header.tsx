import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, User, LogOut, Shield, Dumbbell } from 'lucide-react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, isAdmin, isTrainer, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm border-b border-gray-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/logo_starlight.png" alt="StarLight" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            <button onClick={() => scrollToSection('packages')} className="nav-link">Пакеты</button>
            <span className="inline-block w-px h-5 bg-gray-300 mx-1 shrink-0" />
            <button onClick={() => scrollToSection('trainers')} className="nav-link">Тренеры</button>
            <span className="inline-block w-px h-5 bg-gray-300 mx-1 shrink-0" />
            <button onClick={() => scrollToSection('faq')} className="nav-link">FAQ</button>
            {isAuthenticated && (
              <>
                <span className="inline-block w-px h-5 bg-gray-300 mx-1 shrink-0" />
                <Link to="/packages" className="nav-link">Мои пакеты</Link>
              </>
            )}
            {isTrainer && (
              <>
                <span className="inline-block w-px h-5 bg-gray-300 mx-1 shrink-0" />
                <Link to="/trainer" className="nav-link flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" /> Тренер
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <span className="inline-block w-px h-5 bg-gray-300 mx-1 shrink-0" />
                <Link to="/admin" className="nav-link flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Админ
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#059669] transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.nickname}
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#EF4444] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm py-2.5 px-5">
                  Вход
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2.5 px-5">
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-900 p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-50/95 backdrop-blur-xl border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            <button onClick={() => scrollToSection('packages')} className="mobile-nav-link">Пакеты</button>
            <button onClick={() => scrollToSection('trainers')} className="mobile-nav-link">Тренеры</button>
            <button onClick={() => scrollToSection('faq')} className="mobile-nav-link">FAQ</button>
            {isAuthenticated && (
              <>
                <Link to="/packages" className="mobile-nav-link">Мои пакеты</Link>
                <Link to="/dashboard" className="mobile-nav-link">Личный кабинет</Link>
                {isTrainer && <Link to="/trainer" className="mobile-nav-link">Панель тренера</Link>}
                {isAdmin && <Link to="/admin" className="mobile-nav-link">Админ-панель</Link>}
                <button onClick={logout} className="mobile-nav-link text-[#EF4444]">Выйти</button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="mobile-nav-link">Вход</Link>
                <Link to="/register" className="btn-primary w-full text-center mt-2">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .nav-link {
          @apply px-4 py-2 text-sm font-bold uppercase tracking-wide text-gray-800 hover:text-white hover:bg-[#10B981] transition-all duration-200 rounded-lg;
        }
        .mobile-nav-link {
          @apply block w-full text-left px-4 py-3 text-sm font-bold text-gray-900 hover:text-[#059669] hover:bg-emerald-50 rounded-lg transition-colors;
        }
        .btn-primary {
          @apply inline-flex items-center justify-center bg-[#10B981] text-white font-bold uppercase text-sm rounded-full shadow-sm hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-200 active:scale-[0.97];
        }
        .btn-ghost {
          @apply inline-flex items-center justify-center bg-white border-2 border-gray-800 text-gray-800 font-bold text-sm rounded-full hover:border-[#10B981] hover:text-white hover:bg-[#10B981] transition-all duration-200;
        }
      `}</style>
    </header>
  )
}
