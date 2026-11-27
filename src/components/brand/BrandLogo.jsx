import logoPng from '../../assets/brand/logo.png';
import logoWebp from '../../assets/brand/logo.webp';
import { STORE_CONFIG } from '../../config/store';

/**
 * Official غلاف logo (`Logos/3.png` — horizontal lockup).
 * Rendered exactly as provided: never redrawn, never recolored, never stretched, no effects.
 * When placed on a light surface (e.g. loading fallback), `onLightSurface` wraps it in a solid
 * `#010000` badge matching its native ground so legibility is guaranteed everywhere.
 */
export function BrandLogo({ size = 'md', onLightSurface = false, className = '' }) {
  const heightClass =
    size === 'sm'
      ? 'h-8'
      : size === 'lg'
        ? 'h-11 sm:h-12'
        : 'h-9 sm:h-11';

  const img = (
    <picture className="block shrink-0 select-none">
      <source srcSet={logoWebp} type="image/webp" />
      <img
        src={logoPng}
        alt={STORE_CONFIG.name}
        width={560}
        height={244}
        decoding="async"
        draggable={false}
        className={`block w-auto object-contain select-none ${heightClass} ${className}`}
      />
    </picture>
  );

  if (onLightSurface) {
    return (
      <span className="inline-flex items-center rounded-[var(--radius-ui)] bg-[var(--brand-black)] px-3 py-1.5">
        {img}
      </span>
    );
  }

  return img;
}
