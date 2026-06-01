import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CardResultScreen } from '@/components/scan/card-result-screen';
import { routeParamsToScannedCard } from '@/constants/scan-data';
import { PokemonColors } from '@/constants/pokemon-theme';

export default function SearchResultRoute() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    setName?: string;
    number?: string;
    type?: string;
    imageUrl?: string;
    accentColor?: string;
    gameType?: string;
    rarity?: string;
    estimatedValueBrl?: string;
  }>();
  const router = useRouter();
  const card = routeParamsToScannedCard(params);

  useEffect(() => {
    if (!card) {
      router.replace('/search' as Href);
    }
  }, [card, router]);

  if (!card) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={PokemonColors.primary} />
      </View>
    );
  }

  return <CardResultScreen card={card} source="search" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PokemonColors.screenBackground,
  },
});
