import { type Href, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LongPressCardImage } from '@/components/card-viewer/long-press-card-image';
import { ThemedText } from '@/components/themed-text';
import { type ScannedCard } from '@/constants/scan-data';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import { useCardCollection } from '@/contexts/card-collection-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { formatCardPriceLabel, resolveScannedCardPrice } from '@/utils/pricing';

type CardResultScreenProps = {
  card: ScannedCard;
  source?: 'scan' | 'search';
};

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

export function CardResultScreen({ card, source = 'scan' }: CardResultScreenProps) {
  const router = useRouter();
  const { addCard } = useCardCollection();
  const { selectedGame } = useGameSelection();
  const resolvedGameType = card.gameType ?? selectedGame ?? 'pokemon';

  const handleAddToCollection = () => {
    const price = resolveScannedCardPrice(card);

    addCard({
      id: card.id,
      gameType: resolvedGameType,
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
              gameType={resolvedGameType}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
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
    fontWeight: '600',
    color: PokemonColors.primary,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
  },
  cardPreview: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.three,
    backgroundColor: PokemonColors.primary,
    experimental_backgroundImage: `linear-gradient(135deg, ${PokemonColors.bannerGradientStart}, ${PokemonColors.bannerGradientEnd})`,
    padding: Spacing.three,
  },
  imageFrame: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: PokemonColors.white,
    aspectRatio: 0.72,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: PokemonColors.white,
    borderRadius: 20,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.two,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(247, 208, 70, 0.2)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    marginBottom: Spacing.three,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B8860B',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: PokemonColors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: PokemonColors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: PokemonColors.textPrimary,
  },
  actions: {
    gap: Spacing.two,
  },
  primaryButton: {
    backgroundColor: PokemonColors.primary,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: PokemonColors.white,
  },
  secondaryButton: {
    backgroundColor: PokemonColors.white,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PokemonColors.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: PokemonColors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
