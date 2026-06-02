import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LongPressCardImage } from '@/components/card-viewer/long-press-card-image';
import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import { CollectionCard, useCardCollection } from '@/contexts/card-collection-context';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import { usePricing } from '@/hooks/use-pricing';
import {
  createManualPrice,
  getCardPrice,
  isPriceAvailable,
} from '@/utils/pricing';

type CardDetailScreenProps = {
  card: CollectionCard;
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

export function CardDetailScreen({ card }: CardDetailScreenProps) {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const router = useRouter();
  const navigation = useNavigation();
  const { incrementQuantity, decrementQuantity, removeCard, updateCardPrice } = useCardCollection();
  const { formatCardPrice, formatCardPriceLabel } = usePricing();
  const [showManualPriceInput, setShowManualPriceInput] = useState(false);
  const [manualPriceInput, setManualPriceInput] = useState('');

  const unitPrice = getCardPrice(card);
  const totalPrice =
    unitPrice != null
      ? {
          ...unitPrice,
          amount: unitPrice.amount * card.quantity,
        }
      : undefined;

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

  const handleRemove = () => {
    Alert.alert('Remover carta', `Deseja remover ${card.name} da coleção?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          removeCard(card.id);
          router.back();
        },
      },
    ]);
  };

  const handleSaveManualPrice = () => {
    const normalizedInput = manualPriceInput.trim().replace(',', '.');
    const amount = Number(normalizedInput);

    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Preço inválido', 'Informe um valor maior que zero.');
      return;
    }

    updateCardPrice(card.id, createManualPrice(amount, 'BRL'));
    setManualPriceInput('');
    setShowManualPriceInput(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar">
            <HomeIcon name="chevron.left" fallback="←" size={20} color={colors.textPrimary} />
          </Pressable>
          <ThemedText style={styles.topBarTitle}>Detalhes da carta</ThemedText>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.imageSection}>
            <LongPressCardImage
              imageUrl={card.imageUrl}
              name={card.name}
              cardId={card.id}
              gameType={card.gameType}
              rarity={card.rarity}
              rawData={card.rawData}
              style={styles.imageFrame}
              imageStyle={styles.image}
              contentFit="contain"
              accessibilityLabel={`Pressione e segure para visualizar ${card.name} em tela cheia`}
            />
          </View>

          <View style={styles.detailsCard}>
            <ThemedText style={styles.name}>{card.name}</ThemedText>

            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <ThemedText style={styles.typeBadgeText}>{card.type}</ThemedText>
              </View>
              {card.quantity > 1 ? (
                <View style={styles.duplicateBadge}>
                  <ThemedText style={styles.duplicateBadgeText}>
                    Duplicada x{card.quantity}
                  </ThemedText>
                </View>
              ) : null}
            </View>

            <DetailRow label="Set" value={card.set} />
            <DetailRow label="Número" value={card.number} />
            <DetailRow label="Preço (un.)" value={formatCardPriceLabel(card)} />
            <DetailRow label="Quantidade" value={String(card.quantity)} />
            {isPriceAvailable(totalPrice) && totalPrice ? (
              <DetailRow label="Preço total" value={formatCardPrice(totalPrice)} />
            ) : null}
          </View>

          <View style={styles.manualPriceSection}>
            <ThemedText style={styles.sectionTitle}>Preço manual</ThemedText>
            {showManualPriceInput ? (
              <View style={styles.manualPriceForm}>
                <TextInput
                  style={styles.manualPriceInput}
                  value={manualPriceInput}
                  onChangeText={setManualPriceInput}
                  placeholder="Ex.: 25,00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                />
                <View style={styles.manualPriceActions}>
                  <Pressable
                    style={({ pressed }) => [styles.manualPriceButton, pressed && styles.pressed]}
                    onPress={() => {
                      setShowManualPriceInput(false);
                      setManualPriceInput('');
                    }}>
                    <ThemedText style={styles.manualPriceSecondaryText}>Cancelar</ThemedText>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.manualPriceButtonPrimary,
                      pressed && styles.pressed,
                    ]}
                    onPress={handleSaveManualPrice}>
                    <ThemedText style={styles.manualPricePrimaryText}>Salvar</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.manualPriceTrigger, pressed && styles.pressed]}
                onPress={() => setShowManualPriceInput(true)}
                accessibilityRole="button"
                accessibilityLabel="Adicionar preço manual">
                <ThemedText style={styles.manualPriceTriggerText}>Adicionar preço manual</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.quantityControls}>
            <ThemedText style={styles.sectionTitle}>Gerenciar quantidade</ThemedText>
            <View style={styles.quantityRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.quantityButton,
                  card.quantity <= 1 && styles.quantityButtonDisabled,
                  pressed && card.quantity > 1 && styles.pressed,
                ]}
                onPress={() => decrementQuantity(card.id)}
                disabled={card.quantity <= 1}
                accessibilityRole="button"
                accessibilityLabel="Diminuir quantidade">
                <ThemedText style={styles.quantityButtonText}>−</ThemedText>
              </Pressable>

              <ThemedText style={styles.quantityValue}>{card.quantity}</ThemedText>

              <Pressable
                style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}
                onPress={() => incrementQuantity(card.id)}
                accessibilityRole="button"
                accessibilityLabel="Aumentar quantidade">
                <ThemedText style={styles.quantityButtonText}>+</ThemedText>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel="Remover carta">
            <ThemedText style={styles.removeButtonText}>Remover carta</ThemedText>
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
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  imageSection: {
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
  image: {
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
  name: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: Spacing.two,
  },
  badgeRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  typeBadge: {
    backgroundColor: 'rgba(247, 208, 70, 0.2)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  duplicateBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  duplicateBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.statOrange,
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
  manualPriceSection: {
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
  manualPriceForm: {
    gap: Spacing.two,
  },
  manualPriceInput: {
    backgroundColor: colors.screenBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    color: colors.textPrimary,
  },
  manualPriceActions: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    gap: Spacing.two,
  },
  manualPriceButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  manualPriceButtonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  manualPriceSecondaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  manualPricePrimaryText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
  manualPriceTrigger: {
    alignSelf: 'flex-start' as const,
    paddingVertical: Spacing.one,
  },
  manualPriceTriggerText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  quantityControls: {
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: Spacing.three,
  },
  quantityRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: Spacing.three,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.white,
    lineHeight: 28,
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'center' as const,
  },
  removeButton: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  removeButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FF3B30',
  },
  pressed: {
    opacity: 0.85,
  },
};
}
