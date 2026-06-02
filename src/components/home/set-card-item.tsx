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

type SetCardItemProps = {
  set: CollectionSetGroup;
  onPress?: () => void;
};

export function SetCardItem({ set, onPress }: SetCardItemProps) {
  const styles = usePokemonStyles(createStyles);
  const imageUri = getSetDisplayImage(set);
  const abbreviation = getSetAbbreviation(set.setName);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${set.setName}, ${formatSetProgress(set)}`}>
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
      <ThemedText style={styles.stats} numberOfLines={2}>
        {set.uniqueCardsOwned} únicas
      </ThemedText>
      <ThemedText style={styles.stats}>{set.totalCardsOwned} total</ThemedText>
      {set.completionPercentage != null ? (
        <ThemedText style={styles.progress}>{set.completionPercentage}%</ThemedText>
      ) : null}
    </Pressable>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    width: 108,
    alignItems: 'center' as const,
    marginRight: Spacing.three,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.two,
    backgroundColor: colors.white,
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
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    textAlign: 'center' as const,
    marginBottom: 2,
    minHeight: 34,
  },
  stats: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  progress: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.primary,
    textAlign: 'center' as const,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
