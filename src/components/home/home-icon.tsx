import { StyleSheet, Text } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import { PokemonColors } from '@/constants/pokemon-theme';

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
  color = PokemonColors.textPrimary,
}: HomeIconProps) {
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

const styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
  },
  fallback: {
    textAlign: 'center',
  },
});
