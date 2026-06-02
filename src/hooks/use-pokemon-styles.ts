import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { type PokemonColorPalette, usePokemonColors } from '@/hooks/use-pokemon-colors';

export function usePokemonStyles<T extends Record<string, object>>(
  factory: (colors: PokemonColorPalette) => T,
): T {
  const colors = usePokemonColors();

  return useMemo(
    () => StyleSheet.create(factory(colors) as never),
    [colors],
  ) as T;
}
