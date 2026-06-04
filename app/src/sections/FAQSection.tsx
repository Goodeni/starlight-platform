import { useState } from 'react'
import { ChevronDown, Send } from 'lucide-react'

const faqs = [
  {
    question: 'Что мне нужно, чтобы начать тренироваться?',
    answer: 'Для начала тренировок тебе нужен только компьютер с установленной игрой (Valorant или CS2), микрофон для общения с тренером и желание улучшать свои навыки.',
  },
  {
    question: 'Где будет происходить общение с тренером?',
    answer: 'Все тренировки проходят через Discord. После покупки пакета ты получишь ссылку на приватный сервер, где сможешь общаться со своим тренером и назначать занятия.',
  },
  {
    question: 'Как проходит тренировка?',
    answer: 'Тренировка обычно длится 1-2 часа. Тренер смотрит твои реплеи, анализирует ошибки, дает теоретический материал, а затем проводит практические задания. После каждой сессии ты получаешь план на самостоятельную работу.',
  },
  {
    question: 'Как я могу оплатить пакет тренировок?',
    answer: 'На данный момент мы принимаем оплату через криптовалюту и банковские переводы. После оплаты пакет сразу активируется в твоем личном кабинете.',
  },
  {
    question: 'Какое количество тренировок мне нужно?',
    answer: 'Это зависит от твоего текущего уровня и целей. В среднем ученики видят значительный прогресс после 5-10 тренировок. Тренер даст рекомендации после первого занятия.',
  },
  {
    question: 'Что происходит после оплаты?',
    answer: 'После оплаты ты получаешь доступ к личному кабинету, где можешь выбрать тренера и назначить первую тренировку в удобное время.',
  },
  {
    question: 'Что делать, если я хочу перенести тренировку?',
    answer: 'Перенос возможен не позднее чем за 24 часа до начала. Свяжись со своим тренером в Discord для переноса.',
  },
  {
    question: 'Могу ли я поменять тренера?',
    answer: 'Да, если тебе не подошел текущий тренер, напиши в поддержку и мы подберем тебе другого специалиста.',
  },
]

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border-b border-gray-300 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className={`text-base sm:text-lg font-semibold transition-colors ${isOpen ? 'text-[#059669]' : 'text-gray-900 group-hover:text-[#059669]'}`}>
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#059669]' : 'text-gray-500'}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-black uppercase italic text-gray-900 text-center mb-12">
          ЧАСТЫЕ <span className="text-gradient-green">ВОПРОСЫ</span>
        </h2>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border border-gray-200">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-black uppercase italic text-gray-900 mb-2">
            ОСТАЛИСЬ <span className="text-[#059669]">ВОПРОСЫ?</span>
          </h3>
          <p className="text-lg font-black uppercase text-gray-900 mb-6">
            НАПИШИ НАМ В TG!
          </p>
          <a
            href="https://t.me/StarLightSupport"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-[#10B981] text-[#059669] font-bold uppercase rounded-full px-8 py-3.5 hover:bg-[#10B981] hover:text-[#0A0A0F] transition-all duration-200 active:scale-[0.97]"
          >
            <Send className="w-5 h-5" /> СПРОСИТЬ
          </a>
        </div>
      </div>
    </section>
  )
}
