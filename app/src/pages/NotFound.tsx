import { Link } from 'react-router'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 bg-dot-pattern flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl sm:text-9xl font-black text-[#059669] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Страница не найдена</h2>
        <p className="text-gray-500 mb-8">Запрашиваемая страница не существует</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0A0F] font-bold uppercase py-3 px-8 rounded-full hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all active:scale-[0.97]"
        >
          <Home className="w-5 h-5" /> На главную
        </Link>
      </div>
    </div>
  )
}
