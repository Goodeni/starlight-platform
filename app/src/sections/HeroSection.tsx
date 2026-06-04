import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { Sparkles, ArrowDown } from 'lucide-react'

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const children = section.querySelectorAll('.hero-animate')
    children.forEach((el, i) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.opacity = '0'
      htmlEl.style.transform = 'translateY(30px)'
      setTimeout(() => {
        htmlEl.style.transition = 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)'
        htmlEl.style.opacity = '1'
        htmlEl.style.transform = 'translateY(0)'
      }, 200 + i * 150)
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center bg-dot-pattern overflow-hidden pt-[72px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <h1 className="hero-animate text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase italic leading-[1.05] tracking-tight">
              <span className="text-gray-900">ПЕРСОНАЛЬНЫЕ</span>
              <br />
              <span className="text-gray-900">ТРЕНИРОВКИ С</span>
              <br />
              <span className="text-gradient-green">PRO-ГЕЙМЕРАМИ</span>
            </h1>

            <p className="hero-animate mt-6 text-base sm:text-lg text-gray-500 max-w-lg leading-relaxed">
              Прокачай свои навыки в Valorant и CS2 вместе с профессиональными тренерами. 
              Индивидуальный подход и гарантированный результат.
            </p>

            <div className="hero-animate flex flex-wrap gap-4 mt-8">
              <Link
                to="/register"
                className="btn-primary text-base py-4 px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                НАЧАТЬ ТРЕНИРОВАТЬСЯ
              </Link>
              <button
                onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-base py-4 px-8"
              >
                <ArrowDown className="w-5 h-5 mr-2" />
                УЗНАТЬ БОЛЬШЕ
              </button>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="hero-animate order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
              <img
                src="/hero_gamer.png"
                alt="PRO Gamer"
                className="w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-8 text-sm font-bold uppercase tracking-widest text-gray-400">
              VALORANT <span className="text-[#059669]">&#8226;</span> CS2 <span className="text-[#059669]">&#8226;</span> STARLIGHT <span className="text-[#059669]">&#8226;</span> ТРЕНИРОВКИ <span className="text-[#059669]">&#8226;</span> PRO <span className="text-[#059669]">&#8226;</span> КИБЕРСПОРТ <span className="text-[#059669]">&#8226;</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .btn-primary {
          @apply inline-flex items-center justify-center bg-[#10B981] text-white font-bold uppercase rounded-full hover:bg-[#059669] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-200 active:scale-[0.97];
        }
        .btn-secondary {
          @apply inline-flex items-center justify-center border-2 border-[#10B981] text-[#059669] font-bold uppercase rounded-full hover:bg-[#10B981] hover:text-white transition-all duration-200 active:scale-[0.97];
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
