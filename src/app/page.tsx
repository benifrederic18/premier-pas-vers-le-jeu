import HeroSection from '@/components/sections/HeroSection';
import PresentationSection from '@/components/sections/PresentationSection';
import ProgrammeSection from '@/components/sections/ProgrammeSection';
import GalerieSection from '@/components/sections/GalerieSection';
import InscriptionSection from '@/components/sections/InscriptionSection';
import SponsorsSection from '@/components/sections/SponsorsSection';
import FAQSection from '@/components/sections/FAQSection';
import FooterSection from '@/components/sections/FooterSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PresentationSection />
      <ProgrammeSection />
      <GalerieSection />
      <InscriptionSection />
      <SponsorsSection />
      <FAQSection />
      <FooterSection />
    </main>
  );
}
