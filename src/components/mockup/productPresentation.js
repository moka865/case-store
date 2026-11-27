/**
 * Product Presentation System for غلاف.
 * Maps each case artwork (or fallback hash for future admin products) to a tuned,
 * matte mineral studio stage backdrop so every print pops without competing with UI chrome.
 * Pure presentation lookup — never mutates catalog data shapes.
 */

const STAGE_PALETTES = {
  sandstone: {
    bg: '#EFE9DD',
    halo: 'rgba(206, 50, 24, 0.08)',
    plinth: 'rgba(20, 24, 31, 0.07)',
  },
  mistCobalt: {
    bg: '#E6ECF6',
    halo: 'rgba(23, 70, 184, 0.09)',
    plinth: 'rgba(20, 24, 31, 0.07)',
  },
  sageChalk: {
    bg: '#E3EFE8',
    halo: 'rgba(15, 110, 86, 0.09)',
    plinth: 'rgba(20, 24, 31, 0.07)',
  },
  terracottaWash: {
    bg: '#F4E6DD',
    halo: 'rgba(206, 50, 24, 0.09)',
    plinth: 'rgba(20, 24, 31, 0.07)',
  },
  sunWash: {
    bg: '#F5EED8',
    halo: 'rgba(247, 201, 72, 0.22)',
    plinth: 'rgba(20, 24, 31, 0.07)',
  },
  limestone: {
    bg: '#ECEAE3',
    halo: 'rgba(20, 24, 31, 0.05)',
    plinth: 'rgba(20, 24, 31, 0.07)',
  },
};

const ARTWORK_STAGE_MAP = {
  'tokyo-driftline': { ...STAGE_PALETTES.sandstone, editionNo: '01' },
  'zamalek-dusk': { ...STAGE_PALETTES.mistCobalt, editionNo: '02' },
  'riso-bloom': { ...STAGE_PALETTES.sageChalk, editionNo: '03' },
  'extra-time-90': { ...STAGE_PALETTES.sunWash, editionNo: '04' },
  'koshary-bauhaus': { ...STAGE_PALETTES.mistCobalt, editionNo: '05' },
  'quiet-geometry': { ...STAGE_PALETTES.terracottaWash, editionNo: '06' },
  'midnight-ronin': { ...STAGE_PALETTES.terracottaWash, editionNo: '07' },
  'no-rush-club': { ...STAGE_PALETTES.sandstone, editionNo: '08' },
  'chroma-grid-04': { ...STAGE_PALETTES.limestone, editionNo: '09' },
  'golden-boot-club': { ...STAGE_PALETTES.sunWash, editionNo: '10' },
  'nile-frequency': { ...STAGE_PALETTES.sandstone, editionNo: '11' },
  'paper-orbit': { ...STAGE_PALETTES.sageChalk, editionNo: '12' },
  'mecha-pulse-09': { ...STAGE_PALETTES.mistCobalt, editionNo: '13' },
  'cairo-state': { ...STAGE_PALETTES.sageChalk, editionNo: '14' },
};

const FALLBACK_KEYS = Object.keys(STAGE_PALETTES);

export function getProductStageTheme(artworkId = '') {
  if (artworkId && ARTWORK_STAGE_MAP[artworkId]) {
    return ARTWORK_STAGE_MAP[artworkId];
  }
  let hash = 0;
  const str = String(artworkId || 'ghilaf');
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const palette = STAGE_PALETTES[FALLBACK_KEYS[hash % FALLBACK_KEYS.length]];
  return {
    ...palette,
    editionNo: String((hash % 89) + 10),
  };
}
