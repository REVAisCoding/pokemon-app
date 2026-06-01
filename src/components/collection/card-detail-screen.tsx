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
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import {
  createManualPrice,
  formatCardPrice,
  formatCardPriceLabel,
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
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

export function CardDetailScreen({ card }: CardDetailScreenProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const { incrementQuantity, decrementQuantity, removeCard, updateCardPrice } = useCardCollection();
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
            <HomeIcon name="chevron.left" fallback="←" size={20} color={PokemonColors.textPrimary} />
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
                  placeholderTextColor={PokemonColors.textMuted}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PokemonColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PokemonColors.border,
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  imageSection: {
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
  image: {
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
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.two,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontWeight: '700',
    color: PokemonColors.statOrange,
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
  manualPriceSection: {
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
  manualPriceForm: {
    gap: Spacing.two,
  },
  manualPriceInput: {
    backgroundColor: PokemonColors.screenBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PokemonColors.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    color: PokemonColors.textPrimary,
  },
  manualPriceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  manualPriceButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  manualPriceButtonPrimary: {
    backgroundColor: PokemonColors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  manualPriceSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: PokemonColors.textSecondary,
  },
  manualPricePrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.white,
  },
  manualPriceTrigger: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  manualPriceTriggerText: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.primary,
  },
  quantityControls: {
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.three,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PokemonColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: PokemonColors.white,
    lineHeight: 28,
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: PokemonColors.white,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  removeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF3B30',
  },
  pressed: {
    opacity: 0.85,
  },
});
