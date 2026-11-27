import { CustomizerTeaser } from '../components/home/CustomizerTeaser';
import { HeroSection } from '../components/home/HeroSection';
import { SalonHangGrid } from '../components/home/SalonHangGrid';
import { ShippingTrustBand } from '../components/home/ShippingTrustBand';

/**
 * Home page (`/`):
 * Varied, purposeful Cairo Print-House composition:
 * 1. Asymmetric Print-Press Hero with live device-fit & cross-fading catalog editions
 * 2. Quick-filterable responsive Product Grid (scales 2 -> 3 -> 4 -> 5 -> 6 columns)
 * 3. Dark Studio Customizer Split (photo + Arabic/Latin printed name path)
 * 4. Honest Governorate Shipping & COD Assurance Ledger
 */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <SalonHangGrid previewRows={2} showQuickCategories showViewAllLink ignoreSearch />
      <CustomizerTeaser />
      <ShippingTrustBand />
    </>
  );
}
