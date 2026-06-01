import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeIcon } from '@/components/home/home-icon';
import { SearchResultGridItem } from '@/components/search/search-result-grid-item';
import { ThemedText } from '@/components/themed-text';
import { scannedCardToRouteParams, type ScannedCard } from '@/constants/scan-data';
import { PokemonColors } from '@/constants/pokemon-theme';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { getCardGameConfig } from '@/config/cardGames';
import { useGameSelection } from '@/contexts/game-selection-context';
import { searchCardsByName } from '@/services/pokemonTcgApi';
import {
  riftboundGameCardToScannedCard,
  searchRiftboundCardsByNameAsGameCards,
} from '@/services/riftboundApi';

const SEARCH_DEBOUNCE_MS = 500;

export function SearchScreen() {
  const router = useRouter();
  const { selectedGame } = useGameSelection();
  const gameConfig = getCardGameConfig(selectedGame ?? 'pokemon');
  const isRiftbound = selectedGame === 'riftbound';
  const { initialQuery } = useLocalSearchParams<{ initialQuery?: string }>();
  const [query, setQuery] = useState(initialQuery?.trim() ?? '');
  const [results, setResults] = useState<ScannedCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const cards = isRiftbound
          ? (await searchRiftboundCardsByNameAsGameCards(trimmedQuery)).map(
              riftboundGameCardToScannedCard,
            )
          : await searchCardsByName(trimmedQuery);
        setResults(cards);
        setHasSearched(true);
      } catch (searchError) {
        setResults([]);
        setHasSearched(true);
        setError(
          searchError instanceof Error
            ? searchError.message
            : 'Não foi possível buscar cartas. Tente novamente.',
        );
      } finally {
        setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, isRiftbound]);

  const handleCardPress = (card: ScannedCard) => {
    Keyboard.dismiss();
    router.push({
      pathname: '/search/result',
      params: scannedCardToRouteParams(card),
    } as Href);
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return null;
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Erro na busca</ThemedText>
          <ThemedText style={styles.emptyDescription}>{error}</ThemedText>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyTitle}>Busque uma carta</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            {isRiftbound
              ? 'Digite o nome de uma carta para ver resultados do Riftcodex.'
              : 'Digite o nome de uma carta para ver resultados da Pokémon TCG API.'}
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <ThemedText style={styles.emptyTitle}>Nenhuma carta encontrada</ThemedText>
        <ThemedText style={styles.emptyDescription}>
          Tente outro nome ou verifique a grafia.
        </ThemedText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Buscar</ThemedText>
          <ThemedText style={styles.subtitle}>{gameConfig.label}</ThemedText>
        </View>

        <View style={styles.searchBar}>
          <HomeIcon name="magnifyingglass" fallback="⌕" size={18} color={PokemonColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={gameConfig.searchPlaceholder}
            placeholderTextColor={PokemonColors.textMuted}
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={PokemonColors.primary} />
            <ThemedText style={styles.loadingText}>Buscando cartas...</ThemedText>
          </View>
        ) : null}

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            results.length === 0 && styles.listContentEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <SearchResultGridItem card={item} onPress={() => handleCardPress(item)} />
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
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: PokemonColors.textPrimary,
    padding: 0,
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  loadingText: {
    fontSize: 14,
    color: PokemonColors.textSecondary,
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
  },
});
