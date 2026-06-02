import { Text } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';

type HomeIconProps = {
  name: SFSymbol;
  fallback?: string;
  size?: number;
  color?: string;
};

export function HomeIcon({
  name,
  fallback,
  size = 18,
  color: colorProp,
}: HomeIconProps) {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const color = colorProp ?? colors.textPrimary;

  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      style={styles.icon}
      weight="medium"
      fallback={
        fallback ? (
          <Text style={[styles.fallback, { fontSize: size, color }]}>{fallback}</Text>
        ) : undefined
      }
    />
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  icon: {
    width: 20,
    height: 20,
  },
  fallback: {
    textAlign: 'center' as const,
  },
};
}
