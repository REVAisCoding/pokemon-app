import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CollectionGridItem } from '@/components/collection/collection-grid-item';
import {
  CollectionViewToggle,
  type CollectionViewMode,
} from '@/components/collection/collection-view-toggle';
import { FilterChip } from '@/components/collection/filter-chip';
import { SetGridItem } from '@/components/collection/set-grid-item';
import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { getCardGameConfig } from '@/config/cardGames';
import { useCardCollection } from '@/contexts/card-collection-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { useCollectionSets } from '@/hooks/use-collection-sets';
import { useEnrichedSetGroups } from '@/hooks/use-enriched-set-groups';
import { getDuplicateCards } from '@/utils/getDuplicateCards';
import { getRareCards } from '@/utils/getRareCards';

function parseInitialViewMode(view: string | string[] | undefined): CollectionViewMode | null {
  const raw = Array.isArray(view) ? view[0] : view;

  if (raw === 'duplicates' || raw === 'sets' || raw === 'cards' || raw === 'rares') {
    return raw;
  }

  return null;
}

export function CollectionScreen() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const { view: viewParam } = useLocalSearchParams<{ view?: string | string[] }>();
  const { selectedGame } = useGameSelection();
  const gameConfig = getCardGameConfig(selectedGame ?? 'pokemon');
  const isRiftbound = selectedGame === 'riftbound';
  const { cards, uniqueCards, totalDuplicateCards } = useCardCollection();
  const sets = useCollectionSets();
  const enrichedSets = useEnrichedSetGroups(sets);
  const initialViewMode = parseInitialViewMode(viewParam);
  const [viewMode, setViewMode] = useState<CollectionViewMode>(initialViewMode ?? 'cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const nextViewMode = parseInitialViewMode(viewParam);

    if (nextViewMode) {
      setViewMode(nextViewMode);
    }
  }, [viewParam]);

  const sourceCards = useMemo(() => {
    if (viewMode === 'duplicates') {
      return getDuplicateCards(cards);
    }

    if (viewMode === 'rares') {
      return getRareCards(cards);
    }

    return cards;
  }, [cards, viewMode]);

  const availableSets = useMemo(
    () => [...new Set(sourceCards.map((card) => card.set))].sort(),
    [sourceCards],
  );

  const availableTypes = useMemo(
    () => [...new Set(sourceCards.map((card) => card.type))].sort(),
    [sourceCards],
  );

  const filteredCards = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return sourceCards.filter((card) => {
      const matchesSearch =
        normalizedQuery.length === 0 || card.name.toLowerCase().includes(normalizedQuery);
      const matchesSet = selectedSet === null || card.set === selectedSet;
      const matchesType = selectedType === null || card.type === selectedType;

      return matchesSearch && matchesSet && matchesType;
    });
  }, [sourceCards, searchQuery, selectedSet, selectedType]);

  const showCardFilters = viewMode === 'cards' || viewMode === 'duplicates' || viewMode === 'rares';

  const handleScanPress = () => {
    router.replace('/scan' as Href);
  };

  const handleCardPress = (id: string) => {
    router.push(`/collection/${encodeURIComponent(id)}` as Href);
  };

  const handleSetPress = (setId: string) => {
    router.push(`/collection/set/${encodeURIComponent(setId)}` as Href);
  };

  const handleSearchPress = () => {
    router.replace('/search' as Href);
  };

  const renderCardsEmptyState = () => {
    if (isRiftbound && cards.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Você ainda não adicionou cartas</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Busque cartas de Riftbound na aba Buscar para começar sua coleção.
          </ThemedText>
          <Pressable
            style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            onPress={handleSearchPress}
            accessibilityRole="button"
            accessibilityLabel="Buscar cartas">
            <ThemedText style={styles.emptyButtonText}>Buscar cartas</ThemedText>
          </Pressable>
        </View>
      );
    }

    if (cards.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Você ainda não adicionou cartas</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Escaneie sua primeira carta para começar a montar a coleção.
          </ThemedText>
          <Pressable
            style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            onPress={handleScanPress}
            accessibilityRole="button"
            accessibilityLabel="Escanear carta">
            <ThemedText style={styles.emptyButtonText}>Escanear carta</ThemedText>
          </Pressable>
        </View>
      );
    }

    if (viewMode === 'duplicates' && sourceCards.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Nenhuma carta repetida</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Cartas com quantidade maior que 1 aparecerão nesta aba.
          </ThemedText>
        </View>
      );
    }

    if (viewMode === 'rares' && sourceCards.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Nenhuma carta rara</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Cartas com raridade especial aparecerão nesta aba.
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <ThemedText style={styles.emptyTitle}>Nenhuma carta encontrada</ThemedText>
        <ThemedText style={styles.emptyDescription}>
          Tente ajustar a busca ou remover os filtros.
        </ThemedText>
      </View>
    );
  };

  const renderSetsEmptyState = () => {
    if (isRiftbound && enrichedSets.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Nenhum set na coleção</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Adicione cartas de Riftbound pela busca para ver seus sets aqui.
          </ThemedText>
        </View>
      );
    }

    return (
    <View style={styles.emptyState}>
      <ThemedText style={styles.emptyTitle}>Nenhum set na coleção</ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Seus sets aparecerão aqui quando você adicionar cartas.
      </ThemedText>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Coleção</ThemedText>
          <ThemedText style={styles.subtitle}>
            {gameConfig.label}
            {cards.length === 0
              ? ' · Suas cartas aparecerão aqui'
              : ` · ${uniqueCards} ${uniqueCards === 1 ? 'única' : 'únicas'} · ${totalDuplicateCards} ${totalDuplicateCards === 1 ? 'repetida' : 'repetidas'} · ${sets.length} ${sets.length === 1 ? 'set' : 'sets'}`}
          </ThemedText>
        </View>

        {cards.length > 0 ? (
          <View style={styles.controls}>
            <CollectionViewToggle value={viewMode} onChange={setViewMode} />

            {showCardFilters ? (
              <View style={styles.filters}>
                <View style={styles.searchBar}>
                  <HomeIcon
                    name="magnifyingglass"
                    fallback="⌕"
                    size={18}
                    color={colors.textMuted}
                  />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={gameConfig.searchPlaceholder}
                    placeholderTextColor={colors.textMuted}
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                  />
                </View>

                <ThemedText style={styles.filterLabel}>Set</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  <FilterChip
                    label="Todos"
                    selected={selectedSet === null}
                    onPress={() => setSelectedSet(null)}
                  />
                  {availableSets.map((set) => (
                    <FilterChip
                      key={set}
                      label={set}
                      selected={selectedSet === set}
                      onPress={() => setSelectedSet(set)}
                    />
                  ))}
                </ScrollView>

                <ThemedText style={styles.filterLabel}>Tipo</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  <FilterChip
                    label="Todos"
                    selected={selectedType === null}
                    onPress={() => setSelectedType(null)}
                  />
                  {availableTypes.map((type) => (
                    <FilterChip
                      key={type}
                      label={type}
                      selected={selectedType === type}
                      onPress={() => setSelectedType(type)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}

        {viewMode === 'cards' || viewMode === 'duplicates' || viewMode === 'rares' ? (
          <FlatList
            data={filteredCards}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={[
              styles.listContent,
              filteredCards.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderCardsEmptyState}
            renderItem={({ item }) => (
              <CollectionGridItem
                card={item}
                quantityBadgeFormat={viewMode === 'duplicates' ? 'multiplier' : 'plain'}
                onPress={() => handleCardPress(item.id)}
              />
            )}
          />
        ) : (
          <FlatList
            data={enrichedSets}
            keyExtractor={(item) => item.setId}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={[
              styles.listContent,
              enrichedSets.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderSetsEmptyState}
            renderItem={({ item }) => (
              <SetGridItem set={item} onPress={() => handleSetPress(item.setId)} />
            )}
          />
        )}
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
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  controls: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  filters: {
    gap: Spacing.two,
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.two,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  chipRow: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: Spacing.two,
  },
  emptyState: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: Spacing.two,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    textAlign: 'center' as const,
    marginBottom: Spacing.one,
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: Spacing.three,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
