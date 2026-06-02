import { Image } from 'expo-image';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CollectionGridItem } from '@/components/collection/collection-grid-item';
import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import {
  getSetAbbreviation,
  getSetDisplayImage,
  useEnrichedSetGroup,
} from '@/hooks/use-enriched-set-groups';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { type CollectionSetGroup } from '@/types/collection-set';

type SetDetailScreenProps = {
  set: CollectionSetGroup;
};

type StatItemProps = {
  label: string;
  value: string;
};

function StatItem({ label, value }: StatItemProps) {
  const styles = usePokemonStyles(createStyles);

  return (
    <View style={styles.statItem}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

export function SetDetailScreen({ set }: SetDetailScreenProps) {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const navigation = useNavigation();
  const enrichedSet = useEnrichedSetGroup(set);
  const imageUri = getSetDisplayImage(enrichedSet);
  const abbreviation = getSetAbbreviation(enrichedSet.setName);

  useLayoutEffect(() => {
    const parentNavigation = navigation.getParent();

    parentNavigation?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      parentNavigation?.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [navigation]);

  const handleCardPress = (id: string) => {
    router.push(`/collection/${encodeURIComponent(id)}` as Href);
  };

  const progressLabel =
    enrichedSet.completionPercentage != null
      ? `${enrichedSet.uniqueCardsOwned}/${enrichedSet.printedTotal ?? '?'} · ${enrichedSet.completionPercentage}%`
      : `${enrichedSet.uniqueCardsOwned} cartas únicas`;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar">
            <HomeIcon name="chevron.left" fallback="←" size={20} color={colors.textPrimary} />
          </Pressable>
          <ThemedText style={styles.topBarTitle} numberOfLines={1}>
            {enrichedSet.setName}
          </ThemedText>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.headerCard}>
          <View style={styles.setIcon}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.setLogo}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <ThemedText style={styles.abbreviation}>{abbreviation}</ThemedText>
            )}
          </View>

          <ThemedText style={styles.setName}>{enrichedSet.setName}</ThemedText>

          <View style={styles.statsRow}>
            <StatItem label="Únicas" value={String(enrichedSet.uniqueCardsOwned)} />
            <StatItem label="Total" value={String(enrichedSet.totalCardsOwned)} />
            <StatItem
              label="Progresso"
              value={
                enrichedSet.completionPercentage != null
                  ? `${enrichedSet.completionPercentage}%`
                  : '—'
              }
            />
          </View>

          <ThemedText style={styles.progressCaption}>{progressLabel}</ThemedText>
        </View>

        <FlatList
          data={enrichedSet.cards}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CollectionGridItem card={item} onPress={() => handleCardPress(item.id)} />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    textAlign: 'center' as const,
    marginHorizontal: Spacing.two,
  },
  headerCard: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: Spacing.three,
    alignItems: 'center' as const,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  setIcon: {
    width: 88,
    height: 88,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.two,
    backgroundColor: colors.screenBackground,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden' as const,
  },
  setLogo: {
    width: '82%' as const,
    height: '82%' as const,
  },
  abbreviation: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  setName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    textAlign: 'center' as const,
    marginBottom: Spacing.three,
  },
  statsRow: {
    flexDirection: 'row' as const,
    width: '100%' as const,
    justifyContent: 'space-around' as const,
    marginBottom: Spacing.two,
  },
  statItem: {
    alignItems: 'center' as const,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressCaption: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  columnWrapper: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
