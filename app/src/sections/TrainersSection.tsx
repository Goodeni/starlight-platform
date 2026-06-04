import { Gamepad2 } from 'lucide-react'

const trainers = [
  {
    name: 'Goodeni',
    game: 'VALORANT / CS2',
    rank: 'Immortal 1 / 2500 ELO',
    experience: 'Опыт 2 года',
    image: '/trainer_goodeni.png',
  },
  {
    name: 'EGmen',
    game: 'CS2',
    rank: '2300 ELO',
    experience: 'Опыт 3 года',
    image: '/trainer_egmen.png',
  },
  {
    name: 'Vir9in',
    game: 'VALORANT',
    rank: 'Radiant',
    experience: 'Опыт 4 года',
    image: '/trainer_vir9in.png',
  },
]

export default function TrainersSection() {
  return (
    <section id="trainers" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase italic text-gray-900 mb-4">
            НАШИ <span className="text-gradient-green">ТРЕНЕРЫ</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Подберем тренера под твой уровень игры и задачи. Строгий отбор и огромный опыт работы.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {trainers.map((trainer, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 hover:border-[#10B981]/30 hover:glow-green transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 sm:h-72 bg-white flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent z-10" />
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 bg-[#10B981] text-[#0A0A0F] text-xs font-bold uppercase px-3 py-1 rounded-md">
                    <Gamepad2 className="w-3 h-3" /> {trainer.game}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{trainer.name}</h3>
                <div className="inline-block border border-[#10B981]/50 text-[#059669] text-xs font-bold uppercase px-3 py-1 rounded-md mb-3">
                  {trainer.rank}
                </div>
                <p className="text-sm text-gray-500">{trainer.experience}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
