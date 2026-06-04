import { Shield, Users, Calendar, Trophy } from 'lucide-react'

const advantages = [
  {
    icon: Shield,
    title: 'Результат гарантирован',
    description: 'Гарантированно повысь свой ранг после прохождения плана тренировок от коуча',
  },
  {
    icon: Users,
    title: 'Только опытные тренеры',
    description: 'Наши тренеры — топ 1-2% лучших игроков в мире',
  },
  {
    icon: Calendar,
    title: 'Эффективные форматы',
    description: 'Разрабатываем индивидуальный план занятий для каждого ученика',
  },
  {
    icon: Trophy,
    title: 'Научись зарабатывать',
    description: 'Стань стримером, тренером, профессиональным игроком, участвуй в турнирах',
  },
]

export default function AdvantagesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-black uppercase italic text-gray-900 text-center mb-12">
          ПОЧЕМУ <span className="text-gradient-green">STARLIGHT?</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:border-[#10B981]/30 hover:glow-green transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-4 group-hover:bg-[#10B981]/20 transition-colors">
                <adv.icon className="w-6 h-6 text-[#059669]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{adv.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{adv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
