import { CustomizerTeaser } from '../components/home/CustomizerTeaser';
import { HeroSection } from '../components/home/HeroSection';
import { SalonHangGrid } from '../components/home/SalonHangGrid';

/**
 * Home page (`/`):
 * Short, gallery-paced composition — boldness concentrated in the Hero,
 * followed by a 6-item salon hang and a calm asymmetric customizer teaser.
 */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <SalonHangGrid previewRows={2} showViewAllLink ignoreSearch />
      <CustomizerTeaser />
    </>
  );
}
