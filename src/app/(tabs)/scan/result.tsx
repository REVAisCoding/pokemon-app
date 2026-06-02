import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { CardResultScreen } from '@/components/scan/card-result-screen';
import { routeParamsToScannedCard } from '@/constants/scan-data';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';

export default function ScanResultScreen() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    setName?: string;
    number?: string;
    type?: string;
    imageUrl?: string;
    accentColor?: string;
  }>();
  const router = useRouter();
  const card = routeParamsToScannedCard(params);

  useEffect(() => {
    if (!card) {
      router.replace('/scan/error' as Href);
    }
  }, [card, router]);

  if (!card) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <CardResultScreen card={card} source="scan" />;
}

function createStyles(colors: PokemonColorPalette) {
  return {
  loading: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.screenBackground,
  },
};
}
