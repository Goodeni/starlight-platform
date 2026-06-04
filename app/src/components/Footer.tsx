import { Link } from 'react-router'
import { Send, Gamepad2, Users, HelpCircle, Mail } from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 mb-4">
              <img src="/logo_starlight.png" alt="StarLight" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Персональные тренировки с PRO-геймерами в Valorant и CS2
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Навигация</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" onClick={scrollToTop} className="footer-link flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" /> Главная
                </Link>
              </li>
              <li>
                <Link to="/packages" className="footer-link flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" /> Пакеты
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-link flex items-center gap-2">
                  <Users className="w-4 h-4" /> Регистрация
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-link flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Вход
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Информация</h4>
            <ul className="space-y-3">
              <li><Link to="/" onClick={scrollToTop} className="footer-link flex items-center gap-2"><HelpCircle className="w-4 h-4" /> FAQ</Link></li>
              <li><span className="footer-link flex items-center gap-2 cursor-default"><Send className="w-4 h-4" /> Telegram</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Контакты</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Свяжитесь с нами в Telegram для быстрой поддержки
            </p>
            <a
              href="https://t.me/StarLightSupport"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-[#059669] hover:text-[#059669] transition-colors text-sm font-semibold"
            >
              <Send className="w-4 h-4" /> @StarLightSupport
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400"> 2025 StarLight. Все права защищены.</p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Политика конфиденциальности</span>
            <span className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Условия использования</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          @apply text-sm text-gray-500 hover:text-[#059669] transition-colors duration-200;
        }
      `}</style>
    </footer>
  )
}
