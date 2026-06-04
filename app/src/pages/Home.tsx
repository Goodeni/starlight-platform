import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/sections/HeroSection'
import StatsSection from '@/sections/StatsSection'
import AdvantagesSection from '@/sections/AdvantagesSection'
import PackagesSection from '@/sections/PackagesSection'
import TrainersSection from '@/sections/TrainersSection'
import FAQSection from '@/sections/FAQSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <AdvantagesSection />
        <PackagesSection />
        <TrainersSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
