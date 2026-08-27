/**
 * Canonical astronomical computation utilities.
 *
 * All files that perform ecliptic longitude → sign conversion,
 * angular distance calculations, or numerology reduction must
 * import from this module rather than re-implementing locally.
 */

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export const BODY_GLYPHS: Record<string, string> = {
  sun: '☉',
  moon: '☾',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  chiron: '⚷'
};

export const SIGN_CODES: Record<string, string> = {
  Aries: 'ARI',
  Taurus: 'TAU',
  Gemini: 'GEM',
  Cancer: 'CAN',
  Leo: 'LEO',
  Virgo: 'VIR',
  Libra: 'LIB',
  Scorpio: 'SCO',
  Sagittarius: 'SAG',
  Capricorn: 'CAP',
  Aquarius: 'AQU',
  Pisces: 'PIS'
};

export const ASPECT_GLYPHS: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍'
};

export function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return { sign: ZODIAC_SIGNS[index] ?? 'Aries', degree: Math.round((normalized % 30) * 100) / 100 };
}

export function signedLongitudeDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

/**
 * Numerology digit reduction preserving master numbers 11, 22, 33.
 * This is the canonical version used across all production paths.
 */
export function reduceNumber(value: number): number {
  let current = value;
  while (current > 9 && current !== 11 && current !== 22 && current !== 33) {
    current = String(current).split('').reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

export function titleCase(value: string): string {
  return value.length > 0 ? value[0]!.toUpperCase() + value.slice(1) : value;
}
