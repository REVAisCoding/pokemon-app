import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ProfileSection } from '@/components/profile/profile-section';
import { ThemedText } from '@/components/themed-text';
import { useExchangeRates } from '@/contexts/exchange-rate-context';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/use-network-status';
import {
  formatExchangeRateBrl,
  formatExchangeRateUpdatedAt,
} from '@/utils/exchange-rate-format';

export function ExchangeRateSection() {
  const { rates, isLoading, refresh } = useExchangeRates();
  const isOnline = useNetworkStatus();
  const [, setMinuteTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinuteTick((tick) => tick + 1);
    }, 60_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const updatedAtLabel = formatExchangeRateUpdatedAt(rates.fetchedAt);
  const isEstimated = !rates.fetchedAt;
  const usdLabel = formatExchangeRateBrl(rates.usdToBrl);
  const eurLabel = formatExchangeRateBrl(rates.eurToBrl);

  return (
    <ProfileSection label="Cotação">
      {isLoading && isEstimated ? (
        <ThemedText style={styles.value}>Carregando cotação…</ThemedText>
      ) : (
        <>
          <ThemedText style={styles.value}>
            USD: {usdLabel} · EUR: {eurLabel}
          </ThemedText>
          <ThemedText style={styles.meta}>
            {isEstimated
              ? 'Cotação estimada (sem dados recentes)'
              : updatedAtLabel
                ? `Atualizada ${updatedAtLabel}`
                : 'Atualizada'}
          </ThemedText>
          {isOnline ? (
            <Pressable
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              onPress={() => void refresh()}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Atualizar cotação">
              <ThemedText style={[styles.linkButtonText, isLoading && styles.linkButtonDisabled]}>
                {isLoading ? 'Atualizando…' : 'Atualizar cotação'}
              </ThemedText>
            </Pressable>
          ) : null}
        </>
      )}
    </ProfileSection>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: PokemonColors.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: PokemonColors.textSecondary,
    marginTop: Spacing.one,
    lineHeight: 18,
  },
  linkButton: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.primary,
  },
  linkButtonDisabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
});
