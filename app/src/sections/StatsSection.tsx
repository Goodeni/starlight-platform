import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 3, suffix: '', label: 'ПРОВЕРЕННЫХ ТРЕНЕРА' },
  { value: 50, suffix: '+', label: 'ЗАПЛАНИРОВАННЫХ ТРЕНИРОВОК' },
  { value: 100, suffix: '%', label: 'ИНДИВИДУАЛЬНЫЙ ПОДХОД' },
  { value: 24, suffix: '/7', label: 'ПОДДЕРЖКА УЧЕНИКОВ' },
]

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    const duration = 2000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(eased * target))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [started, target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  return (
    <section id="stats" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-200">
          <h2 className="text-3xl sm:text-4xl font-black uppercase italic text-gray-900 mb-2">
            О НАС В ЦИФРАХ
          </h2>
          <p className="text-gray-500 mb-10 text-sm">
            Мы новая тренировочная платформа, но с амбициозными целями
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#059669] mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
