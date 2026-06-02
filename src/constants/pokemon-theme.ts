export const PokemonColorsLight = {
  screenBackground: '#F4F4F7',
  primary: '#6C63FF',
  primaryDark: '#5A52E0',
  primaryLight: '#8B84FF',
  bannerGradientStart: '#7B73F7',
  bannerGradientEnd: '#6C63FF',
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#8E8E93',
  textMuted: '#AEAEB2',
  border: '#ECECF0',
  shadow: '#1A1A2E',
  statPurple: '#6C63FF',
  statOrange: '#FF9500',
  statGreen: '#34C759',
  statBlue: '#007AFF',
  badge: '#6C63FF',
} as const;

export const PokemonColorsDark = {
  screenBackground: '#0E0E12',
  primary: '#8B84FF',
  primaryDark: '#6C63FF',
  primaryLight: '#A39DFF',
  bannerGradientStart: '#7B73F7',
  bannerGradientEnd: '#6C63FF',
  white: '#1C1C24',
  textPrimary: '#F4F4F7',
  textSecondary: '#A0A0A8',
  textMuted: '#6C6C70',
  border: '#2C2C34',
  shadow: '#000000',
  statPurple: '#8B84FF',
  statOrange: '#FF9F0A',
  statGreen: '#30D158',
  statBlue: '#0A84FF',
  badge: '#8B84FF',
} as const;

export type PokemonColorPalette = typeof PokemonColorsLight | typeof PokemonColorsDark;

export function getPokemonColors(scheme: 'light' | 'dark'): PokemonColorPalette {
  return scheme === 'dark' ? PokemonColorsDark : PokemonColorsLight;
}

/** Prefer {@link usePokemonColors} in components so styles react to theme changes. */
export const PokemonColors = PokemonColorsLight;
