/**
 * Cohesive 1.85px-stroke geometric print-studio iconography for غلاف.
 * Directional icons (arrows, chevrons, trucks) are built for RTL reading direction.
 */

export function ChevronDownIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/**
 * Directional Back arrow mirrored for RTL (points right toward inline-start).
 */
export function BackArrowRtlIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 8h10" />
      <path d="M9 4l4 4-4 4" />
    </svg>
  );
}

/**
 * Directional Forward arrow for RTL (points left toward inline-end).
 */
export function ForwardArrowRtlIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M13 8H3" />
      <path d="M7 4L3 8l4 4" />
    </svg>
  );
}

export function SearchIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="9" r="5.75" />
      <path d="M13.25 13.25L17.25 17.25" />
    </svg>
  );
}

export function CartBagIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4.5 6.5h11l.9 10.5H3.6L4.5 6.5z" />
      <path d="M7.25 6.5V5a2.75 2.75 0 0 1 5.5 0v1.5" />
    </svg>
  );
}

export function CloseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 8.4l3.1 3.1L13 4.6" />
    </svg>
  );
}

export function UploadIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 13V4" />
      <path d="M6.5 7.5L10 4l3.5 3.5" />
      <path d="M3.5 14v1.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V14" />
    </svg>
  );
}

export function PhoneHardwareIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="5.25" y="2.25" width="9.5" height="15.5" rx="2.4" />
      <rect x="7.5" y="4.5" width="3.2" height="3.2" rx="0.8" />
    </svg>
  );
}

export function CashCodIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="4.75" width="15" height="10.5" rx="2" />
      <circle cx="10" cy="10" r="2.25" />
      <path d="M5.25 8v4M14.75 8v4" />
    </svg>
  );
}

export function CustomPenIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z" />
      <path d="M11.5 5.5l3 3" />
    </svg>
  );
}

export function HomeNavIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 8.5L10 3l7 5.5v8a1 1 0 0 1-1 1h-3.8v-5h-4.4v5H4a1 1 0 0 1-1-1v-8z" />
    </svg>
  );
}

export function CategoriesGridIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="5.8" height="5.8" rx="1.4" />
      <rect x="11.2" y="3" width="5.8" height="5.8" rx="1.4" />
      <rect x="3" y="11.2" width="5.8" height="5.8" rx="1.4" />
      <rect x="11.2" y="11.2" width="5.8" height="5.8" rx="1.4" />
    </svg>
  );
}

export function CustomizeSparkIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="4.5" y="2.5" width="11" height="15" rx="2.4" />
      <path d="M10 7.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </svg>
  );
}

export function MenuBarsRtlIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3.5 5.5h13" />
      <path d="M6.5 10h10" />
      <path d="M3.5 14.5h13" />
    </svg>
  );
}

/* ---------- Social icons (same 20px grid & 1.85 stroke as the rest of the set) ---------- */

function StrokeIcon({ className, children }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <StrokeIcon className={className}>
      <rect x="3" y="3" width="14" height="14" rx="4.2" />
      <circle cx="10" cy="10" r="3.3" />
      <circle cx="14.4" cy="5.6" r="0.6" fill="currentColor" stroke="none" />
    </StrokeIcon>
  );
}

export function FacebookIcon({ className = 'w-5 h-5' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M11.4 17.5v-6.4h2.3l.4-2.7h-2.7V6.9c0-.8.3-1.3 1.4-1.3h1.4V3.2a17 17 0 0 0-2.1-.1c-2.1 0-3.4 1.3-3.4 3.6v1.7H6.4v2.7h2.3v6.4" />
    </StrokeIcon>
  );
}

export function TikTokIcon({ className = 'w-5 h-5' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M8.4 8.6a3.9 3.9 0 1 0 3.3 3.85V2.8c.5 2.25 2 3.7 4.3 3.95" />
    </StrokeIcon>
  );
}

/* ---------- Policy icons ---------- */

export function ExchangeIcon({ className = 'w-5 h-5' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 7.5h11.5l-3-3" />
      <path d="M16 12.5H4.5l3 3" />
    </StrokeIcon>
  );
}

export function ClockIcon({ className = 'w-5 h-5' }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.2l2.8 1.8" />
    </StrokeIcon>
  );
}

export function EyeIcon({ className = 'w-5 h-5' }) {
  return (
    <StrokeIcon className={className}>
      <path d="M2.5 10s2.7-5 7.5-5 7.5 5 7.5 5-2.7 5-7.5 5-7.5-5-7.5-5z" />
      <circle cx="10" cy="10" r="2.3" />
    </StrokeIcon>
  );
}
