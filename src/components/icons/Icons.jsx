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
