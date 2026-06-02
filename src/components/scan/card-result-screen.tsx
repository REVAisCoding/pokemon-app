import { type Href, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LongPressCardImage } from '@/components/card-viewer/long-press-card-image';
import { ThemedText } from '@/components/themed-text';
import { type ScannedCard } from '@/constants/scan-data';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import { useCardCollection } from '@/contexts/card-collection-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { usePricing } from '@/hooks/use-pricing';
import { resolveScannedCardPrice } from '@/utils/pricing';

type CardResultScreenProps = {
  card: ScannedCard;
  source?: 'scan' | 'search';
};

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  const styles = usePokemonStyles(createStyles);

  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

export function CardResultScreen({ card, source = 'scan' }: CardResultScreenProps) {
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const { addCard } = useCardCollection();
  const { selectedGame } = useGameSelection();
  const { formatCardPriceLabel } = usePricing();
  const activeGameType = selectedGame ?? 'pokemon';

  const handleAddToCollection = () => {
    const price = resolveScannedCardPrice(card);

    addCard({
      id: card.id,
      gameType: activeGameType,
      name: card.name,
      set: card.setName,
      number: card.number,
      type: card.type,
      imageUrl: card.imageUrl,
      ...(price ? { price } : {}),
      ...(card.setId ? { setId: card.setId } : {}),
      ...(card.tcgplayerId ? { rawData: { tcgplayer_id: card.tcgplayerId } } : {}),
      ...(card.setPrintedTotal ? { setPrintedTotal: card.setPrintedTotal } : {}),
      ...(card.setLogo ? { setLogo: card.setLogo } : {}),
      ...(card.setSymbol ? { setSymbol: card.setSymbol } : {}),
      ...(card.rarity ? { rarity: card.rarity } : {}),
    });

    Alert.alert('Carta adicionada!', undefined, [
      { text: 'OK', onPress: () => router.replace('/' as Href) },
    ]);
  };

  const handleSecondaryAction = () => {
    if (source === 'search') {
      router.back();
      return;
    }

    router.replace('/scan' as Href);
  };

  const eyebrow = source === 'search' ? 'Resultado da busca' : 'Resultado do scan';
  const secondaryLabel = source === 'search' ? 'Voltar à busca' : 'Escanear outra';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
            <ThemedText style={styles.title}>Carta identificada!</ThemedText>
          </View>

          <View style={styles.cardPreview}>
            <LongPressCardImage
              imageUrl={card.imageUrl}
              name={card.name}
              gameType={activeGameType}
              rarity={card.rarity}
              style={styles.imageFrame}
              imageStyle={styles.cardImage}
              contentFit="contain"
              accessibilityLabel={`Pressione e segure para visualizar ${card.name} em tela cheia`}
            />
          </View>

          <View style={styles.detailsCard}>
            <ThemedText style={styles.cardName}>{card.name}</ThemedText>

            <View style={styles.typeBadge}>
              <ThemedText style={styles.typeBadgeText}>{card.type}</ThemedText>
            </View>

            <DetailRow label="Set" value={card.setName} />
            <DetailRow label="Número" value={card.number} />
            <DetailRow
              label="Preço"
              value={formatCardPriceLabel(card)}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={handleAddToCollection}
              accessibilityRole="button"
              accessibilityLabel="Adicionar à coleção">
              <ThemedText style={styles.primaryButtonText}>Adicionar à coleção</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={handleSecondaryAction}
              accessibilityRole="button"
              accessibilityLabel={secondaryLabel}>
              <ThemedText style={styles.secondaryButtonText}>{secondaryLabel}</ThemedText>
            </Pressable>
          </View>
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
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    marginBottom: Spacing.three,
    paddingTop: Spacing.two,
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
  },
  cardPreview: {
    borderRadius: 24,
    overflow: 'hidden' as const,
    marginBottom: Spacing.three,
    backgroundColor: colors.primary,
    experimental_backgroundImage: `linear-gradient(135deg, ${colors.bannerGradientStart}, ${colors.bannerGradientEnd})`,
    padding: Spacing.three,
  },
  imageFrame: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    backgroundColor: colors.white,
    aspectRatio: 0.72,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  cardImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: Spacing.two,
  },
  typeBadge: {
    alignSelf: 'flex-start' as const,
    backgroundColor: 'rgba(247, 208, 70, 0.2)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    marginBottom: Spacing.three,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#B8860B',
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  actions: {
    gap: Spacing.two,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
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
