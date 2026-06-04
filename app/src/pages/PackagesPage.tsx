import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Check, Star, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

const packagesData = [
  {
    id: 1,
    name: 'Базовый',
    price: 1500,
    description: 'Идеально для начинающих игроков, которые хотят понять свои ошибки и получить направление для развития.',
    features: ['Разбор игры', 'Консультация с тренером'],
    highlighted: false,
  },
  {
    id: 2,
    name: 'Продвинутый',
    price: 2000,
    description: 'Для серьезного прогресса. Тренер составит персональный план и проконтролирует его выполнение.',
    features: ['Разбор игры', 'Консультация', 'Персональный план тренировок'],
    highlighted: false,
  },
  {
    id: 3,
    name: 'PRO',
    price: 4000,
    description: 'Максимальный результат. Полный разбор всех аспектов игры с постоянным мониторингом.',
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

export default function PackagesPage() {
  const { isAuthenticated } = useAuth()
  const [purchasedId, setPurchasedId] = useState<number | null>(null)

  const purchaseMutation = trpc.user.purchasePackage.useMutation({
    onSuccess: (_, vars) => {
      setPurchasedId(vars.packageId)
    },
  })

  const handlePurchase = (packageId: number) => {
    if (!isAuthenticated) return
    purchaseMutation.mutate({ packageId })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#059669] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> На главную
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-black uppercase italic text-gray-900 mb-4">
              ВЫБЕРИ СВОЙ <span className="text-gradient-green">ПАКЕТ</span>
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Каждый пакет разработан для максимальной эффективности. PRO пакет — лучший выбор для серьезных игроков.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {packagesData.map((pkg) => (
              <div
                key={pkg.id}
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

                {purchasedId === pkg.id ? (
                  <div className="w-full text-center py-3.5 rounded-full bg-[#10B981]/20 text-[#059669] font-bold text-sm">
                    КУПЛЕНО
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchaseMutation.isPending}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold uppercase text-sm transition-all active:scale-[0.97] disabled:opacity-50 ${
                      pkg.highlighted
                        ? 'bg-[#10B981] text-[#0A0A0F] hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                        : 'border-2 border-[#10B981] text-[#059669] hover:bg-[#10B981] hover:text-[#0A0A0F]'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {purchaseMutation.isPending ? 'Обработка...' : 'КУПИТЬ'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
