import { STORE_CONFIG } from '../../config/store';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '../icons/Icons';

const SOCIAL_ITEMS = [
  { key: 'instagram', label: 'انستجرام', Icon: InstagramIcon },
  { key: 'facebook', label: 'فيسبوك', Icon: FacebookIcon },
  { key: 'tiktok', label: 'تيك توك', Icon: TikTokIcon },
];

function isPlaceholderUrl(url) {
  return !url || url === '#';
}

/**
 * Instagram / Facebook / TikTok links driven by `STORE_CONFIG.social`.
 * Placeholder values ('#') render the icon but don't navigate, so the page never jumps.
 * `tone="dark"` for brand-black surfaces (Footer), `tone="light"` for paper/white surfaces.
 */
export function SocialLinks({ tone = 'dark', className = '' }) {
  const toneClass =
    tone === 'dark'
      ? 'border-white/18 text-white hover:border-[var(--brand-yellow)] hover:bg-[var(--brand-yellow)] hover:text-[var(--ink)]'
      : 'border-[var(--border-strong)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white';

  return (
    <ul className={`flex items-center gap-2.5 ${className}`} aria-label={`حسابات ${STORE_CONFIG.name} على السوشيال ميديا`}>
      {SOCIAL_ITEMS.map(({ key, label, Icon }) => {
        const url = STORE_CONFIG.social?.[key];
        const placeholder = isPlaceholderUrl(url);
        return (
          <li key={key}>
            <a
              href={placeholder ? '#' : url}
              data-social={key}
              data-placeholder={placeholder || undefined}
              {...(placeholder
                ? { onClick: (e) => e.preventDefault() }
                : { target: '_blank', rel: 'noopener noreferrer' })}
              aria-label={`${STORE_CONFIG.name} على ${label}`}
              title={label}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-150 ${toneClass}`}
            >
              <Icon className="h-5 w-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
