import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import InteractiveDemoSection from '@/components/InteractiveDemoSection';
import ProjectsSection from '@/components/ProjectsSection';
import GamefiedSection from '@/components/GamefiedSection';
import AnalyticsSection from '@/components/AnalyticsSection';
import CombinedStatsTestimonialsSection from '@/components/CombinedStatsTestimonialsSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <InteractiveDemoSection />
      <ProjectsSection />
      <GamefiedSection />
      <AnalyticsSection />
      <CombinedStatsTestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
