import { getPokemonColors, type PokemonColorPalette } from '@/constants/pokemon-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type { PokemonColorPalette };

export function usePokemonColors(): PokemonColorPalette {
  const scheme = useColorScheme();

  return getPokemonColors(scheme === 'dark' ? 'dark' : 'light');
}
