import HeroSection from '../../components/HeroSection';
import FeaturesSection from '../../components/FeaturesSection';
import AboutSection from '../../components/AboutSection';
import PricingSection from '../../components/PricingSection';
import ContactSection from '../../components/ContactSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <PricingSection />
      <ContactSection />
    </main>
  );
} 