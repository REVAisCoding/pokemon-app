import { Image } from 'expo-image';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CollectionGridItem } from '@/components/collection/collection-grid-item';
import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import {
  getSetAbbreviation,
  getSetDisplayImage,
  useEnrichedSetGroup,
} from '@/hooks/use-enriched-set-groups';
import { PokemonColors } from '@/constants/pokemon-theme';
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
  return (
    <View style={styles.statItem}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

export function SetDetailScreen({ set }: SetDetailScreenProps) {
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
            <HomeIcon name="chevron.left" fallback="←" size={20} color={PokemonColors.textPrimary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PokemonColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PokemonColors.border,
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    textAlign: 'center',
    marginHorizontal: Spacing.two,
  },
  headerCard: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    backgroundColor: PokemonColors.white,
    borderRadius: 20,
    padding: Spacing.three,
    alignItems: 'center',
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  setIcon: {
    width: 88,
    height: 88,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
    backgroundColor: PokemonColors.screenBackground,
    borderWidth: 1,
    borderColor: PokemonColors.border,
    overflow: 'hidden',
  },
  setLogo: {
    width: '82%',
    height: '82%',
  },
  abbreviation: {
    fontSize: 24,
    fontWeight: '800',
    color: PokemonColors.primary,
  },
  setName: {
    fontSize: 20,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: Spacing.two,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: PokemonColors.textSecondary,
  },
  progressCaption: {
    fontSize: 13,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
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
});
