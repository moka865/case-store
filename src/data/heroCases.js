import heroCase1 from '../assets/hero/case-1.png';
import heroCase2 from '../assets/hero/case-2.png';
import heroCase3 from '../assets/hero/case-3.png';

/**
 * Featured hero case showcase pieces (transparent PNG cutouts).
 * Lives in the mock data layer so an admin dashboard or API can replace
 * the featured hero rotation cleanly without touching HeroSection.
 */
export const HERO_CASES = [
  {
    id: 'persian-stallions',
    name: 'Persian Stallions',
    imageUrl: heroCase1,
    altAr: 'تصميم Persian Stallions',
  },
  {
    id: 'morning-shift-edition',
    name: 'Morning Shift Edition',
    imageUrl: heroCase2,
    altAr: 'تصميم Morning Shift Edition',
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    imageUrl: heroCase3,
    altAr: 'تصميم Starry Night',
  },
];
