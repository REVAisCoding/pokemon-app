import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import {
  formatSetProgress,
  getSetAbbreviation,
  getSetDisplayImage,
} from '@/hooks/use-enriched-set-groups';
import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import { type CollectionSetGroup } from '@/types/collection-set';

type SetGridItemProps = {
  set: CollectionSetGroup;
  onPress: () => void;
};

export function SetGridItem({ set, onPress }: SetGridItemProps) {
  const styles = usePokemonStyles(createStyles);
  const imageUri = getSetDisplayImage(set);
  const abbreviation = getSetAbbreviation(set.setName);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${set.setName}, ${formatSetProgress(set)}`}>
      <View style={styles.card}>
        <View style={styles.icon}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.logo} contentFit="contain" transition={200} />
          ) : (
            <ThemedText style={styles.abbreviation}>{abbreviation}</ThemedText>
          )}
        </View>

        <ThemedText style={styles.name} numberOfLines={2}>
          {set.setName}
        </ThemedText>
        <ThemedText style={styles.meta}>{set.uniqueCardsOwned} cartas únicas</ThemedText>
        <ThemedText style={styles.meta}>{set.totalCardsOwned} total</ThemedText>
        {set.completionPercentage != null ? (
          <ThemedText style={styles.progress}>{set.completionPercentage}% concluído</ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: Spacing.two,
    alignItems: 'center' as const,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.two,
    backgroundColor: colors.screenBackground,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden' as const,
  },
  logo: {
    width: '82%' as const,
    height: '82%' as const,
  },
  abbreviation: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  name: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    textAlign: 'center' as const,
    marginBottom: Spacing.one,
    minHeight: 36,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  progress: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.primary,
    textAlign: 'center' as const,
    marginTop: Spacing.one,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
