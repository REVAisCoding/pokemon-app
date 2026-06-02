export function formatExchangeRateBrl(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatExchangeRateUpdatedAt(fetchedAt: string): string | null {
  if (!fetchedAt) {
    return null;
  }

  const fetchedAtMs = Date.parse(fetchedAt);

  if (Number.isNaN(fetchedAtMs)) {
    return null;
  }

  const diffMinutes = Math.floor((Date.now() - fetchedAtMs) / 60_000);

  if (diffMinutes < 1) {
    return 'agora';
  }

  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `há ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return diffDays === 1 ? 'há 1 dia' : `há ${diffDays} dias`;
}
