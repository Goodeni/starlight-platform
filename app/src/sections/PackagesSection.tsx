import { Check, Star } from 'lucide-react'
import { Link } from 'react-router'

const packagesData = [
  {
    name: 'Базовый',
    price: 1500,
    description: 'Идеально для начинающих',
    features: ['Разбор игры', 'Консультация с тренером'],
    highlighted: false,
  },
  {
    name: 'Продвинутый',
    price: 2000,
    description: 'Для серьезного прогресса',
    features: ['Разбор игры', 'Консультация', 'Персональный план тренировок'],
    highlighted: false,
  },
  {
    name: 'PRO',
    price: 4000,
    description: 'Максимальный результат',
    features: [
      'Разбор игры',
      'Консультация',
      'Персональный план тренировок',
      'Разбор таймингов',
      'Разбор гранат',
      'Экономика игры',
      'Базовые действия по карте',
      'Мониторинг результатов',
    ],
    highlighted: true,
  },
]

export default function PackagesSection() {
  return (
    <section id="packages" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase italic text-gray-900 mb-4">
            НАШИ <span className="text-gradient-green">ПАКЕТЫ</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Выбери пакет, который подходит именно тебе. Каждый пакет разработан для максимальной эффективности
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {packagesData.map((pkg, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                pkg.highlighted
                  ? 'bg-gray-50 border-2 border-[#10B981] glow-green-strong scale-[1.02] md:scale-105'
                  : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#10B981] text-[#0A0A0F] text-xs font-bold uppercase px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Лучший выбор
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-[#059669]">{pkg.price.toLocaleString()}</span>
                <span className="text-lg text-gray-500">₽</span>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#059669]" />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block w-full text-center py-3.5 rounded-full font-bold uppercase text-sm transition-all duration-200 active:scale-[0.97] ${
                  pkg.highlighted
                    ? 'bg-[#10B981] text-[#0A0A0F] hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                    : 'border-2 border-[#10B981] text-[#059669] hover:bg-[#10B981] hover:text-[#0A0A0F]'
                }`}
              >
                ВЫБРАТЬ
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
