import LandingNavbar from '../components/LandingNavbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import AnalyticsPreview from '../components/AnalyticsPreview'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <Hero />
      <Features />
      <AnalyticsPreview />
      <Testimonials />
      <Footer />
    </div>
  )
}
