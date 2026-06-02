import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CardEstimatedValue } from '@/components/shared/card-estimated-value';
import { ThemedText } from '@/components/themed-text';
import { scannedCardToRouteParams, type ScannedCard } from '@/constants/scan-data';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import { consumePendingScanCandidates } from '@/services/scanResultStore';

type CandidateCardProps = {
  card: ScannedCard;
  onPress: () => void;
};

function CandidateCard({ card, onPress }: CandidateCardProps) {
  const styles = usePokemonStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [styles.candidateCard, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Selecionar ${card.name}, ${card.setName}`}>
      <View style={styles.imageFrame}>
        <Image
          source={{ uri: card.imageUrl }}
          style={styles.cardImage}
          contentFit="contain"
          transition={200}
        />
      </View>

      <ThemedText style={styles.cardName} numberOfLines={1}>
        {card.name}
      </ThemedText>
      <ThemedText style={styles.cardMeta} numberOfLines={1}>
        {card.setName}
      </ThemedText>
      <ThemedText style={styles.cardMeta}>{card.number}</ThemedText>
      <CardEstimatedValue card={card} />
    </Pressable>
  );
}

export function CandidateConfirmScreen() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const [candidates, setCandidates] = useState<ScannedCard[]>([]);
  const [extractedName, setExtractedName] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const pending = consumePendingScanCandidates();

    if (!pending || pending.cards.length === 0) {
      router.replace('/scan/error' as Href);
      return;
    }

    setCandidates(pending.cards);
    setExtractedName(pending.extractedName);
    setIsReady(true);
  }, [router]);

  const handleSelectCard = (card: ScannedCard) => {
    router.replace({
      pathname: '/scan/result',
      params: scannedCardToRouteParams(card),
    } as Href);
  };

  const handleSearchManually = () => {
    router.replace({
      pathname: '/search',
      params: { initialQuery: extractedName?.trim() ?? '' },
    } as Href);
  };

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText style={styles.eyebrow}>Confirme a carta</ThemedText>
            <ThemedText style={styles.title}>Qual é a carta correta?</ThemedText>
            <ThemedText style={styles.subtitle}>
              Encontramos {candidates.length} possibilidade
              {candidates.length === 1 ? '' : 's'}. Toque na carta certa para continuar.
            </ThemedText>
          </View>

          <View style={styles.candidatesList}>
            {candidates.map((card) => (
              <CandidateCard key={card.id} card={card} onPress={() => handleSelectCard(card)} />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            onPress={handleSearchManually}
            accessibilityRole="button"
            accessibilityLabel="Buscar manualmente">
            <ThemedText style={styles.secondaryButtonText}>Nenhuma delas — buscar manualmente</ThemedText>
          </Pressable>
        </ScrollView>
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
  loading: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.screenBackground,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    paddingTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  candidatesList: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  candidateCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: Spacing.three,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  imageFrame: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    backgroundColor: colors.border,
    aspectRatio: 0.72,
    marginBottom: Spacing.two,
  },
  cardImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
