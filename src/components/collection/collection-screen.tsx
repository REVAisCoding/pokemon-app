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
import { PokemonColors } from '@/constants/pokemon-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { getCardGameConfig } from '@/config/cardGames';
import { useCardCollection } from '@/contexts/card-collection-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { useCollectionSets } from '@/hooks/use-collection-sets';
import { useEnrichedSetGroups } from '@/hooks/use-enriched-set-groups';
import { getDuplicateCards } from '@/utils/getDuplicateCards';

function parseInitialViewMode(view: string | string[] | undefined): CollectionViewMode | null {
  const raw = Array.isArray(view) ? view[0] : view;

  if (raw === 'duplicates' || raw === 'sets' || raw === 'cards') {
    return raw;
  }

  return null;
}

export function CollectionScreen() {
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

  const showCardFilters = viewMode === 'cards' || viewMode === 'duplicates';

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
                    color={PokemonColors.textMuted}
                  />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={gameConfig.searchPlaceholder}
                    placeholderTextColor={PokemonColors.textMuted}
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

        {viewMode === 'cards' || viewMode === 'duplicates' ? (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
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
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    color: PokemonColors.textSecondary,
  },
  controls: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  filters: {
    gap: Spacing.two,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: PokemonColors.white,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: PokemonColors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: PokemonColors.textPrimary,
    padding: 0,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: PokemonColors.textSecondary,
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
    backgroundColor: PokemonColors.white,
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  emptyButton: {
    backgroundColor: PokemonColors.primary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.white,
  },
  pressed: {
    opacity: 0.85,
  },
});
