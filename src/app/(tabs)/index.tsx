import { type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/home-header';
import { MySetsSection } from '@/components/home/my-sets-section';
import {
  DuplicateCardsEmptyHint,
  DuplicateCardsSection,
} from '@/components/home/duplicate-cards-section';
import { RecentCollectionSection } from '@/components/home/recent-collection-section';
import { StatsSummaryRow } from '@/components/home/stats-summary-row';
import { ThemedView } from '@/components/themed-view';
import { type HomeStat } from '@/constants/home-data';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { getCardGameConfig } from '@/config/cardGames';
import { getUserDisplayName, useAuth } from '@/contexts/auth-context';
import { useCardCollection } from '@/contexts/card-collection-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { useCollectionSets } from '@/hooks/use-collection-sets';
import { formatCollectionEstimatedValueBrl } from '@/utils/pricing';
import { getDuplicateCards } from '@/utils/getDuplicateCards';

export default function HomeScreen() {
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { user } = useAuth();
  const { selectedGame } = useGameSelection();
  const gameConfig = getCardGameConfig(selectedGame ?? 'pokemon');
  const { cards, uniqueCards, totalDuplicateCards, uniqueSets, totalRareCards, totalEstimatedValueBrl } =
    useCardCollection();
  const sets = useCollectionSets();

  const duplicateCards = useMemo(() => getDuplicateCards(cards), [cards]);

  const stats = useMemo<HomeStat[]>(
    () => [
      { id: 'unique', label: 'Únicas', value: String(uniqueCards), icon: 'unique' },
      {
        id: 'duplicates',
        label: 'Repetidas',
        value: String(totalDuplicateCards),
        icon: 'duplicates',
      },
      { id: 'sets', label: 'Sets', value: String(uniqueSets), icon: 'sets' },
      { id: 'rares', label: 'Raras', value: String(totalRareCards), icon: 'rares' },
      {
        id: 'value',
        label: 'Valor estimado',
        value: formatCollectionEstimatedValueBrl(totalEstimatedValueBrl),
        icon: 'value',
      },
    ],
    [uniqueCards, totalDuplicateCards, uniqueSets, totalRareCards, totalEstimatedValueBrl],
  );

  const handleScanPress = () => {
    router.replace('/scan' as Href);
  };

  const handleSeeAllPress = () => {
    navigation.navigate('collection', { screen: 'index' });
  };

  const handleSeeAllDuplicatesPress = () => {
    navigation.navigate('collection', { screen: 'index', params: { view: 'duplicates' } });
  };

  const handleSeeAllSetsPress = () => {
    navigation.navigate('collection', { screen: 'index', params: { view: 'sets' } });
  };

  const handleStatPress = (statId: HomeStat['id']) => {
    if (statId === 'duplicates') {
      navigation.navigate('collection', { screen: 'index', params: { view: 'duplicates' } });
      return;
    }

    if (statId === 'sets') {
      navigation.navigate('collection', { screen: 'index', params: { view: 'sets' } });
      return;
    }

    if (statId === 'rares') {
      navigation.navigate('collection', { screen: 'index', params: { view: 'rares' } });
    }
  };

  const handleCardPress = (id: string) => {
    router.push(`/collection/${encodeURIComponent(id)}` as Href);
  };

  const handleSetPress = (setId: string) => {
    router.push(`/collection/set/${encodeURIComponent(setId)}` as Href);
  };

  const handleBackPress = () => {
    router.push('/game-select');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <HomeHeader
            userName={getUserDisplayName(user)}
            subtitle={`Sua coleção de ${gameConfig.label}`}
            onBackPress={handleBackPress}
          />
          <StatsSummaryRow stats={stats} onStatPress={handleStatPress} />
          <RecentCollectionSection
            cards={cards}
            onSeeAllPress={handleSeeAllPress}
            onCardPress={handleCardPress}
            onScanFirstPress={handleScanPress}
          />
          <DuplicateCardsSection
            cards={duplicateCards}
            onSeeAllPress={handleSeeAllDuplicatesPress}
            onCardPress={handleCardPress}
          />
          <DuplicateCardsEmptyHint
            visible={cards.length > 0 && duplicateCards.length === 0}
          />
          <MySetsSection
            sets={sets}
            onSeeAllPress={handleSeeAllSetsPress}
            onSetPress={handleSetPress}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
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
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
};
}
