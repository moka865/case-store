/**
 * Bespoke SVG Brand Mark & Geometric Kufic Wordmark for "غلاف".
 * - Right side (inline-start in RTL): Camera-frame print-sleeve emblem with offset Cairo Vermilion layer
 *   and Sunburst lens accent.
 * - Left side: Authentic modernist Cairo Kufic vector wordmark (غـلـا + ف) with clean two-jaw Kufic Ghayn,
 *   angled Lam-Alef ligature, looped Faa, and dual Vermilion diamond dots.
 */
export function GhilafLogo({ theme = 'light', size = 'md', className = '' }) {
  const isDark = theme === 'dark';
  const ink = isDark ? '#F7F5F0' : '#14181F';
  const surface = isDark ? '#14181F' : '#F7F5F0';
  const brand = '#CE3218';
  const sun = '#F7C948';

  const heightClass =
    size === 'sm' ? 'h-7' : size === 'lg' ? 'h-10 sm:h-11' : 'h-8 sm:h-9';

  return (
    <svg
      viewBox="0 0 136 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      dir="ltr"
      aria-hidden="true"
      className={`w-auto shrink-0 select-none ${heightClass} ${className}`}
    >
      {/* === 1. Camera-Sleeve Print Emblem (Right / RTL Start: x=102..133) === */}
      <rect x="102" y="6" width="23" height="32" rx="6" fill={brand} />
      <rect
        x="107"
        y="3"
        width="23"
        height="32"
        rx="6"
        fill={ink}
        stroke={isDark ? '#2A313D' : ink}
        strokeWidth="1"
      />
      <rect x="111" y="7" width="9.5" height="10.5" rx="2.8" fill={surface} />
      <circle cx="115.75" cy="12.25" r="2.5" fill={sun} />
      <rect x="122.5" y="28.5" width="3.5" height="2" rx="1" fill={brand} />

      {/* === 2. Authentic Modernist Kufic Wordmark "غلاف" (x=4..94) === */}

      {/* --- Isolated Faa (ف) on the left (x=4..38) --- */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 23.5C4 22.67 4.67 22 5.5 22H8.2C9.03 22 9.7 22.67 9.7 23.5V30H22.5V21.2C22.5 18.05 25.05 15.5 28.2 15.5H32.3C35.45 15.5 38 18.05 38 21.2V33.5C38 34.6 37.1 35.5 36 35.5H6.5C5.12 35.5 4 34.38 4 33V23.5ZM28.2 20.6C27.81 20.6 27.5 20.91 27.5 21.3V25.1C27.5 25.49 27.81 25.8 28.2 25.8H32.2C32.59 25.8 32.9 25.49 32.9 25.1V21.3C32.9 20.91 32.59 20.6 32.2 20.6H28.2Z"
        fill={ink}
      />
      {/* Faa diamond dot */}
      <path d="M30.25 6.4L33.75 9.9L30.25 13.4L26.75 9.9L30.25 6.4Z" fill={brand} />

      {/* --- Connected Ghayn-Lam-Alef (غلا) on the right (x=44..94) --- */}
      {/* Two-jaw arched Kufic Ghayn (right) flowing along baseline into tall Lam + angled Alef (left) */}
      <path
        d="M45.2 9.2C44.75 8.25 45.44 7.15 46.5 7.15H49.6C50.42 7.15 51.16 7.64 51.49 8.39L60.2 28.2V7.8C60.2 6.97 60.87 6.3 61.7 6.3H64.5C65.33 6.3 66 6.97 66 7.8V30H74.6V23C74.6 18.58 78.18 15 82.6 15H91.5C92.49 15 93.3 15.81 93.3 16.8V19.6C93.3 20.59 92.49 21.4 91.5 21.4H82.6C81.16 21.4 80.2 22.36 80.2 23.8V30H92.8C93.68 30 94.4 30.72 94.4 31.6V33.9C94.4 34.78 93.68 35.5 92.8 35.5H57.8C56.85 35.5 55.99 34.94 55.61 34.07L45.2 9.2Z"
        fill={ink}
      />
      {/* Subtle angled Kufic nib tooth on upper-right of Ghayn */}
      <path d="M88.2 18.5H93.3V23.4C93.3 24.17 92.67 24.8 91.9 24.8H89.6C88.83 24.8 88.2 24.17 88.2 23.4V18.5Z" fill={ink} />
      {/* Ghayn diamond dot */}
      <path d="M84.4 6.4L87.9 9.9L84.4 13.4L80.9 9.9L84.4 6.4Z" fill={brand} />
    </svg>
  );
}
