import { useId } from 'react';
import { CaseArtwork } from './CaseArtworks';

/**
 * Reusable optical camera lens unit with anodized metallic ring, recessed barrel,
 * multi-coating sapphire reflection, and micro-glint.
 */
function OpticalLens({ cx, cy, r = 16 }) {
  const innerR = r * 0.46;
  const glintR = Math.max(1.6, r * 0.14);
  return (
    <g>
      {/* Outer metallic bezel shadow */}
      <circle cx={cx} cy={cy + 1} r={r + 0.8} fill="#08090C" opacity="0.55" />
      {/* Anodized bezel ring */}
      <circle cx={cx} cy={cy} r={r} fill="#0E1015" stroke="#4D5360" strokeWidth="1.9" />
      {/* Inner stepped aperture ring */}
      <circle cx={cx} cy={cy} r={r * 0.72} fill="#090B0E" stroke="#242933" strokeWidth="1" />
      {/* Multi-coated optical element */}
      <circle cx={cx} cy={cy} r={innerR} fill="#18273D" />
      <circle cx={cx + innerR * 0.22} cy={cy + innerR * 0.22} r={innerR * 0.55} fill="#13384C" opacity="0.65" />
      {/* Specular studio catchlight */}
      <circle cx={cx - innerR * 0.36} cy={cy - innerR * 0.36} r={glintR} fill="#9CC0F0" opacity="0.78" />
      <circle cx={cx + innerR * 0.32} cy={cy + innerR * 0.32} r={glintR * 0.55} fill="#6EE7B7" opacity="0.4" />
    </g>
  );
}

/**
 * Per-model realistic camera island cutouts rendered in 240x500 device coordinates.
 * Always rendered LTR so phone hardware geometry is never mirrored in RTL.
 */
function CameraCutout({ layout }) {
  switch (layout) {
    case 'apple-pro-triple':
      return (
        <g>
          {/* Recessed protective case lip around camera plateau */}
          <rect x="16.5" y="16.5" width="101" height="107" rx="27.5" fill="#121419" opacity="0.6" />
          <rect x="18" y="18" width="98" height="104" rx="26" fill="#1E2128" stroke="#3D424D" strokeWidth="2.2" />
          <rect x="20" y="19.5" width="94" height="101" rx="24.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.07" strokeWidth="1" />
          <OpticalLens cx={44} cy={44} r={17} />
          <OpticalLens cx={44} cy={94} r={17} />
          <OpticalLens cx={88} cy={69} r={17} />
          {/* TrueTone Flash & LiDAR */}
          <circle cx="88" cy="36" r="6.5" fill="#EAE0C8" stroke="#353942" strokeWidth="1.2" />
          <circle cx="88" cy="36" r="3.2" fill="#FFF7DF" />
          <circle cx="88" cy="100" r="6" fill="#2A2E37" stroke="#16181D" strokeWidth="1" />
          <circle cx="71" cy="84" r="2.1" fill="#0B0C0F" />
        </g>
      );

    case 'apple-dual-diag':
      return (
        <g>
          <rect x="16.5" y="16.5" width="91" height="93" rx="25.5" fill="#121419" opacity="0.55" />
          <rect x="18" y="18" width="88" height="90" rx="24" fill="#1E2128" stroke="#3D424D" strokeWidth="2.2" />
          <OpticalLens cx={42} cy={42} r={16} />
          <OpticalLens cx={80} cy={82} r={16} />
          <circle cx="80" cy="40" r="5.8" fill="#EAE0C8" stroke="#353942" strokeWidth="1.2" />
          <circle cx="42" cy="84" r="3.5" fill="#2C303A" />
        </g>
      );

    case 'apple-dual-vert':
      return (
        <g>
          <rect x="18.5" y="16.5" width="49" height="97" rx="24.5" fill="#121419" opacity="0.55" />
          <rect x="20" y="18" width="46" height="94" rx="23" fill="#1E2128" stroke="#3D424D" strokeWidth="2.2" />
          <OpticalLens cx={43} cy={42} r={14.5} />
          <OpticalLens cx={43} cy={88} r={14.5} />
          <circle cx="80" cy="65" r="5.8" fill="#EAE0C8" stroke="#22252C" strokeWidth="1.5" />
        </g>
      );

    case 'samsung-ultra-5':
      return (
        <g>
          <rect x="17" y="17" width="76" height="124" rx="15" fill="#121419" opacity="0.55" />
          <rect x="18" y="18" width="74" height="122" rx="14" fill="#1D2026" stroke="#3B404B" strokeWidth="2" />
          <OpticalLens cx={38} cy={39} r={14} />
          <OpticalLens cx={38} cy={79} r={14} />
          <OpticalLens cx={38} cy={119} r={14} />
          <OpticalLens cx={72} cy={48} r={8.5} />
          <circle cx="72" cy="79" r="5.2" fill="#EAE0C8" />
          <OpticalLens cx={72} cy={110} r={8.5} />
        </g>
      );

    case 'samsung-vertical-3':
      return (
        <g>
          <rect x="19" y="19" width="40" height="116" rx="20" fill="#121419" opacity="0.5" />
          <rect x="20" y="20" width="38" height="114" rx="19" fill="#1D2026" stroke="#3B404B" strokeWidth="2" />
          <OpticalLens cx={39} cy={40} r={12} />
          <OpticalLens cx={39} cy={77} r={12} />
          <OpticalLens cx={39} cy={114} r={12} />
          <circle cx="72" cy="58" r="4.8" fill="#EAE0C8" stroke="#22252C" strokeWidth="1.4" />
        </g>
      );

    case 'xiaomi-square-quad':
      return (
        <g>
          <rect x="16.5" y="16.5" width="105" height="105" rx="23.5" fill="#121419" opacity="0.55" />
          <rect x="18" y="18" width="102" height="102" rx="22" fill="#1B1D23" stroke="#3D424E" strokeWidth="2.2" />
          <OpticalLens cx={46} cy={46} r={15} />
          <OpticalLens cx={92} cy={46} r={15} />
          <OpticalLens cx={46} cy={92} r={15} />
          <circle cx="92" cy="92" r="9" fill="#EAE0C8" stroke="#343842" strokeWidth="1.4" />
        </g>
      );

    case 'xiaomi-rect-triple':
      return (
        <g>
          <rect x="18" y="18" width="78" height="106" rx="18" fill="#1C1F26" stroke="#3D424E" strokeWidth="2" />
          <OpticalLens cx={42} cy={44} r={15} />
          <OpticalLens cx={42} cy={92} r={15} />
          <OpticalLens cx={76} cy={68} r={11} />
          <circle cx="76" cy="36" r="4.8" fill="#EAE0C8" />
        </g>
      );

    case 'poco-wide-bar':
      return (
        <g>
          <rect x="16" y="18" width="208" height="92" rx="18" fill="#1A1D24" stroke="#3D424E" strokeWidth="2" />
          <OpticalLens cx={48} cy={46} r={14} />
          <OpticalLens cx={48} cy={84} r={14} />
          <OpticalLens cx={90} cy={46} r={14} />
          <circle cx="90" cy="84" r="7" fill="#EAE0C8" />
        </g>
      );

    case 'circular-center':
      return (
        <g>
          <circle cx="120" cy="95" r="57.5" fill="#121419" opacity="0.55" />
          <circle cx="120" cy="94" r="56" fill="#1A1D24" stroke="#424754" strokeWidth="2.6" />
          <circle cx="120" cy="94" r="47" fill="none" stroke="#2F343E" strokeWidth="1.4" />
          <OpticalLens cx={98} cy={78} r={13} />
          <OpticalLens cx={142} cy={78} r={13} />
          <OpticalLens cx={120} cy={118} r={14} />
          <circle cx="120" cy="58" r="4.8" fill="#EAE0C8" />
        </g>
      );

    case 'pill-dual-side':
    default:
      return (
        <g>
          <rect x="20" y="18" width="52" height="106" rx="26" fill="#1C1F26" stroke="#3D424E" strokeWidth="2" />
          <OpticalLens cx={46} cy={46} r={16} />
          <OpticalLens cx={46} cy={94} r={16} />
          <circle cx="86" cy="54" r="5.2" fill="#EAE0C8" stroke="#22252C" strokeWidth="1.5" />
        </g>
      );
  }
}

/**
 * Reusable flat front-view phone case mockup.
 * Preserves exact 240x500 print geometry, clip coordinates, and Customizer printSpec transforms,
 * while rendering studio polycarbonate rim lighting and multi-element camera lens detail.
 */
export function PhoneCaseMockup({
  model,
  artworkId = null,
  artworkNode = null,
  customImage = null,
  printedName = null,
  shadow = true,
  interactive = true,
  className = '',
  style = undefined,
  onPointerDown = undefined,
  onPointerMove = undefined,
  onPointerUp = undefined,
  ariaLabel = undefined,
}) {
  const uid = useId().replace(/:/g, '');
  const clipId = `case-clip-${uid}`;
  const sheenId = `case-sheen-${uid}`;
  const rimId = `case-rim-${uid}`;

  const cornerRadius = model?.cornerRadius ?? 34;
  const cameraLayout = model?.cameraLayout ?? 'apple-pro-triple';
  const aspectRatio = model?.aspectRatio ?? 0.48;

  const shadowClass =
    shadow === false
      ? ''
      : shadow === 'sm'
        ? 'case-wall-shadow-sm'
        : shadow === 'md'
          ? 'case-wall-shadow-md'
          : shadow === 'lg'
            ? 'case-wall-shadow-lg'
            : 'case-wall-shadow';

  const nameTopPercent =
    printedName?.placement === 'top'
      ? '36%'
      : printedName?.placement === 'center'
        ? '58%'
        : '82%';

  const isArabicName = printedName?.script === 'arabic';
  const nameColor = printedName?.ink === 'dark' ? '#14181F' : '#F7F5F0';

  return (
    <div
      dir="ltr"
      className={`relative select-none ${interactive ? 'case-lift-self' : ''} ${className}`}
      style={{
        aspectRatio: `${aspectRatio}`,
        containerType: 'inline-size',
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      <div className={`relative h-full w-full ${interactive ? 'case-lift-motion' : ''}`}>
        <svg
          viewBox="-6 -4 252 508"
          className={`block h-full w-full overflow-visible ${shadowClass} ${
            interactive && shadow !== false ? 'case-lift-shadow' : ''
          }`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Exact print area geometry preserved: 6,6 -> 228x488 */}
            <clipPath id={clipId}>
              <rect x="6" y="6" width="228" height="488" rx={Math.max(8, cornerRadius - 4)} />
            </clipPath>
            {/* Matte polycarbonate bumper rim studio lighting */}
            <linearGradient id={rimId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#323742" />
              <stop offset="28%" stopColor="#1E2128" />
              <stop offset="100%" stopColor="#14161B" />
            </linearGradient>
            {/* Subtle overhead matte ink paper finish (keeps print colors true) */}
            <linearGradient id={sheenId} x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.055" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#0E1117" stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {/* Tactile anodized side buttons with top specular highlight */}
          <g>
            <rect x="-4" y="92" width="4.5" height="24" rx="2" fill="#252932" />
            <rect x="-3.5" y="93" width="1.2" height="22" rx="0.6" fill="#505766" opacity="0.55" />

            <rect x="-4" y="132" width="4.5" height="44" rx="2" fill="#252932" />
            <rect x="-3.5" y="133" width="1.2" height="42" rx="0.6" fill="#505766" opacity="0.55" />

            <rect x="-4" y="186" width="4.5" height="44" rx="2" fill="#252932" />
            <rect x="-3.5" y="187" width="1.2" height="42" rx="0.6" fill="#505766" opacity="0.55" />

            <rect x="239.5" y="148" width="4.5" height="58" rx="2" fill="#252932" />
            <rect x="242.5" y="149" width="1.2" height="56" rx="0.6" fill="#505766" opacity="0.45" />
          </g>

          {/* Matte polycarbonate outer bumper shell */}
          <rect x="0" y="0" width="240" height="500" rx={cornerRadius} fill={`url(#${rimId})`} />
          {/* Top-edge subtle studio rim catchlight */}
          <rect
            x="1"
            y="1"
            width="238"
            height="498"
            rx={Math.max(9, cornerRadius - 1)}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.11"
            strokeWidth="1"
          />

          {/* Clipped back print area (exact 240x500 coordinate space) */}
          <g clipPath={`url(#${clipId})`}>
            <rect x="0" y="0" width="240" height="500" fill="#F7F5F0" />

            {artworkNode}

            {!artworkNode && artworkId && (!customImage?.url || customImage.url.startsWith('idb://')) ? (
              <CaseArtwork artworkId={artworkId} />
            ) : null}

            {customImage?.url && !customImage.url.startsWith('idb://') ? (
              <g
                transform={`translate(${120 + (customImage.x || 0) * 1.4}, ${
                  250 + (customImage.y || 0) * 2.4
                }) rotate(${customImage.rotation || 0}) scale(${customImage.scale || 1})`}
              >
                <image
                  href={customImage.url}
                  x="-120"
                  y="-250"
                  width="240"
                  height="500"
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            ) : null}

            {/* Matte polycarbonate surface finish */}
            <rect x="0" y="0" width="240" height="500" fill={`url(#${sheenId})`} pointerEvents="none" />
          </g>

          {/* Precision inner bumper seam */}
          <rect
            x="6"
            y="6"
            width="228"
            height="488"
            rx={Math.max(8, cornerRadius - 4)}
            fill="none"
            stroke="#111318"
            strokeWidth="1.5"
            opacity="0.38"
          />

          {/* Authentic per-model camera island cutout */}
          <CameraCutout layout={cameraLayout} />
        </svg>

        {/* Native HTML overlay for crisp joined Arabic / Latin printed names */}
        {printedName?.enabled && printedName?.text?.trim() ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[10%] flex items-center justify-center text-center"
            style={{
              top: nameTopPercent,
              transform: 'translateY(-50%)',
            }}
          >
            <span
              dir={isArabicName ? 'rtl' : 'ltr'}
              lang={isArabicName ? 'ar' : 'en'}
              className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5 leading-snug"
              style={{
                fontFamily: printedName.fontFamily || '"IBM Plex Sans Arabic", sans-serif',
                fontWeight: printedName.fontWeight || 700,
                letterSpacing: isArabicName ? '0px' : printedName.letterSpacing || '0px',
                color: nameColor,
                fontSize: 'clamp(4.5px, 10.5cqw, 28px)',
                textShadow:
                  printedName.ink === 'dark'
                    ? '0 1px 0 rgba(247,245,240,0.45)'
                    : '0 1px 2px rgba(20,24,31,0.5)',
              }}
            >
              {printedName.text}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
