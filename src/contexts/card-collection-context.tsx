import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { useGameSelection } from '@/contexts/game-selection-context';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { useNetworkStatus } from '@/hooks/use-network-status';
import {
  deleteCardFromCloud,
  fetchUserCardsFromCloud,
  mergeLocalAndRemoteCards,
  syncCollectionToCloud,
  upsertCardToCloud,
} from '@/services/collectionCloudService';
import {
  collectionNeedsEnrichment,
  enrichCollectionCards,
} from '@/services/collectionEnrichment';
import {
  loadCollectionFromStorage,
  saveCollectionToStorage,
} from '@/services/collectionStorage';
import { type CardGameType, type CardPrice } from '@/types/cardGame';
import { type AddCollectionCardInput, type CollectionCard } from '@/types/collection-card';
import {
  filterCardsByGameType,
  getCollectionCardGameType,
  normalizeCollectionCard,
  reconcileCollectionCards,
} from '@/utils/collectionCardMigration';
import { useExchangeRates } from '@/contexts/exchange-rate-context';
import { calculateCollectionEstimatedValue } from '@/utils/pricing';
import { getCardRarity, isRareCard } from '@/utils/card-rarity';
import { deriveSetIdFromCard } from '@/utils/deriveSetIdFromCard';
import { countDuplicateCards } from '@/utils/getDuplicateCards';

export type { AddCollectionCardInput, CollectionCard };

type CardCollectionContextValue = {
  cards: CollectionCard[];
  isLoading: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  addCard: (card: AddCollectionCardInput) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  removeCard: (id: string) => void;
  updateCardPrice: (id: string, price: CardPrice) => void;
  totalCards: number;
  uniqueCards: number;
  totalDuplicateCards: number;
  uniqueSets: number;
  totalRareCards: number;
  totalEstimatedValueBrl: number;
};

const CardCollectionContext = createContext<CardCollectionContextValue | null>(null);

type CardCollectionProviderProps = {
  children: ReactNode;
};

function withUpdatedTimestamp(card: CollectionCard): CollectionCard {
  return {
    ...card,
    updatedAt: new Date().toISOString(),
  };
}

export function CardCollectionProvider({ children }: CardCollectionProviderProps) {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const { user } = useAuth();
  const { selectedGame } = useGameSelection();
  const { rates } = useExchangeRates();
  const isOnline = useNetworkStatus();
  const [allCards, setAllCards] = useState<CollectionCard[]>([]);
  const activeGameType: CardGameType = selectedGame ?? 'pokemon';
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasHydratedRef = useRef(false);
  const syncInProgressRef = useRef(false);
  const allCardsRef = useRef<CollectionCard[]>([]);
  const wasOnlineRef = useRef(true);
  const userId = user?.id;

  const cards = useMemo(
    () => filterCardsByGameType(allCards, activeGameType),
    [allCards, activeGameType],
  );

  const syncWithCloud = useCallback(
    async (localCards: CollectionCard[]) => {
      if (!userId || !isOnline || syncInProgressRef.current) {
        return localCards;
      }

      syncInProgressRef.current = true;
      setIsSyncing(true);

      try {
        const remoteCards = await fetchUserCardsFromCloud(userId);
        const mergedCards = mergeLocalAndRemoteCards(localCards, remoteCards);

        await syncCollectionToCloud(userId, mergedCards);
        await saveCollectionToStorage(userId, mergedCards);
        setAllCards(mergedCards);

        return mergedCards;
      } catch {
        return localCards;
      } finally {
        syncInProgressRef.current = false;
        setIsSyncing(false);
      }
    },
    [userId, isOnline],
  );

  const syncWithCloudRef = useRef(syncWithCloud);
  syncWithCloudRef.current = syncWithCloud;

  const persistCardToCloud = useCallback(
    async (card: CollectionCard) => {
      if (!userId || !isOnline) {
        return;
      }

      try {
        await upsertCardToCloud(userId, card);
      } catch {
        // Offline or transient errors are handled on the next sync.
      }
    },
    [userId, isOnline],
  );

  const removeCardFromCloudSafe = useCallback(
    async (cardApiId: string) => {
      if (!userId || !isOnline) {
        return;
      }

      try {
        await deleteCardFromCloud(userId, cardApiId);
      } catch {
        // Offline or transient errors are handled on the next sync.
      }
    },
    [userId, isOnline],
  );

  useEffect(() => {
    let isMounted = true;
    hasHydratedRef.current = false;
    const hydrateCollection = async () => {
      if (!userId) {
        if (isMounted) {
          setAllCards([]);
          setIsLoading(false);
        }

        return;
      }

      setIsLoading(true);

      try {
        const localCards = reconcileCollectionCards(
          (await loadCollectionFromStorage(userId)).map(normalizeCollectionCard),
        );

        if (!isMounted) {
          return;
        }

        setAllCards(localCards);
        await syncWithCloudRef.current(localCards);
        hasHydratedRef.current = true;
        setIsLoading(false);
      } finally {
        if (isMounted) {
          hasHydratedRef.current = true;
          setIsLoading(false);
        }
      }
    };

    void hydrateCollection();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    allCardsRef.current = allCards;
  }, [allCards]);

  useEffect(() => {
    if (!userId || !hasHydratedRef.current) {
      return;
    }

    void saveCollectionToStorage(userId, allCards);
  }, [allCards, userId]);

  useEffect(() => {
    if (!userId || !hasHydratedRef.current) {
      wasOnlineRef.current = isOnline;
      return;
    }

    const cameOnline = isOnline && !wasOnlineRef.current;
    wasOnlineRef.current = isOnline;

    if (cameOnline) {
      void syncWithCloudRef.current(allCardsRef.current);
    }
  }, [isOnline, userId]);

  const addCard = useCallback(
    (card: AddCollectionCardInput) => {
      const gameType = activeGameType;

      setAllCards((currentCards) => {
        const existingIndex = currentCards.findIndex(
          (item) => item.id === card.id && getCollectionCardGameType(item) === gameType,
        );
        let nextCards: CollectionCard[];

        if (existingIndex === -1) {
          const newCard = withUpdatedTimestamp({
            ...card,
            gameType,
            quantity: 1,
            setName: card.setName ?? card.set,
          });
          nextCards = reconcileCollectionCards([newCard, ...currentCards]);
          void persistCardToCloud(newCard);

          return nextCards;
        }

        const updatedCard = withUpdatedTimestamp({
          ...currentCards[existingIndex],
          price:
            currentCards[existingIndex].price?.source === 'manual'
              ? currentCards[existingIndex].price
              : (card.price ?? currentCards[existingIndex].price),
          rarity: card.rarity ?? currentCards[existingIndex].rarity,
          setId: currentCards[existingIndex].setId ?? card.setId,
          setPrintedTotal: currentCards[existingIndex].setPrintedTotal ?? card.setPrintedTotal,
          setLogo: currentCards[existingIndex].setLogo ?? card.setLogo,
          setSymbol: currentCards[existingIndex].setSymbol ?? card.setSymbol,
          quantity: currentCards[existingIndex].quantity + 1,
        });
        const remainingCards = currentCards.filter(
          (item) => !(item.id === card.id && getCollectionCardGameType(item) === gameType),
        );
        nextCards = reconcileCollectionCards([updatedCard, ...remainingCards]);
        void persistCardToCloud(updatedCard);

        return nextCards;
      });
    },
    [activeGameType, persistCardToCloud],
  );

  const incrementQuantity = useCallback(
    (id: string) => {
      setAllCards((currentCards) => {
        const existingIndex = currentCards.findIndex(
          (item) => item.id === id && getCollectionCardGameType(item) === activeGameType,
        );

        if (existingIndex === -1) {
          return currentCards;
        }

        const updatedCard = withUpdatedTimestamp({
          ...currentCards[existingIndex],
          quantity: currentCards[existingIndex].quantity + 1,
        });
        const remainingCards = currentCards.filter(
          (item) => !(item.id === id && getCollectionCardGameType(item) === activeGameType),
        );
        const nextCards = [updatedCard, ...remainingCards];

        void persistCardToCloud(updatedCard);

        return nextCards;
      });
    },
    [activeGameType, persistCardToCloud],
  );

  const decrementQuantity = useCallback(
    (id: string) => {
      setAllCards((currentCards) => {
        const existingIndex = currentCards.findIndex(
          (item) => item.id === id && getCollectionCardGameType(item) === activeGameType,
        );

        if (existingIndex === -1 || currentCards[existingIndex].quantity <= 1) {
          return currentCards;
        }

        const updatedCard = withUpdatedTimestamp({
          ...currentCards[existingIndex],
          quantity: currentCards[existingIndex].quantity - 1,
        });
        const remainingCards = currentCards.filter(
          (item) => !(item.id === id && getCollectionCardGameType(item) === activeGameType),
        );
        const nextCards = [updatedCard, ...remainingCards];

        void persistCardToCloud(updatedCard);

        return nextCards;
      });
    },
    [activeGameType, persistCardToCloud],
  );

  const removeCard = useCallback(
    (id: string) => {
      setAllCards((currentCards) => {
        void removeCardFromCloudSafe(id);
        return currentCards.filter(
          (item) => !(item.id === id && getCollectionCardGameType(item) === activeGameType),
        );
      });
    },
    [activeGameType, removeCardFromCloudSafe],
  );

  const updateCardPrice = useCallback(
    (id: string, price: CardPrice) => {
      setAllCards((currentCards) =>
        currentCards.map((card) => {
          if (card.id !== id || getCollectionCardGameType(card) !== activeGameType) {
            return card;
          }

          return withUpdatedTimestamp({ ...card, price });
        }),
      );
    },
    [activeGameType],
  );

  const totalCards = useMemo(
    () => cards.reduce((total, card) => total + card.quantity, 0),
    [cards],
  );

  const uniqueCards = useMemo(() => cards.length, [cards]);

  const totalDuplicateCards = useMemo(() => countDuplicateCards(cards), [cards]);

  const uniqueSets = useMemo(
    () => new Set(cards.map(deriveSetIdFromCard)).size,
    [cards],
  );

  const totalRareCards = useMemo(
    () =>
      cards.reduce(
        (total, card) => total + (isRareCard(getCardRarity(card)) ? card.quantity : 0),
        0,
      ),
    [cards],
  );

  const totalEstimatedValueBrl = useMemo(
    () => calculateCollectionEstimatedValue(cards, rates),
    [cards, rates],
  );

  useEffect(() => {
    if (isLoading || !collectionNeedsEnrichment(allCards)) {
      return;
    }

    let cancelled = false;

    void enrichCollectionCards(allCards).then((enrichedCards) => {
      if (!cancelled && enrichedCards !== allCards) {
        setAllCards(enrichedCards);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [allCards, isLoading]);

  const value = useMemo(
    () => ({
      cards,
      isLoading,
      isSyncing,
      isOnline,
      addCard,
      incrementQuantity,
      decrementQuantity,
      removeCard,
      updateCardPrice,
      totalCards,
      uniqueCards,
      totalDuplicateCards,
      uniqueSets,
      totalRareCards,
      totalEstimatedValueBrl,
    }),
    [
      cards,
      isLoading,
      isSyncing,
      isOnline,
      addCard,
      incrementQuantity,
      decrementQuantity,
      removeCard,
      updateCardPrice,
      totalCards,
      uniqueCards,
      totalDuplicateCards,
      uniqueSets,
      totalRareCards,
      totalEstimatedValueBrl,
    ],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <CardCollectionContext.Provider value={value}>{children}</CardCollectionContext.Provider>
  );
}

export function useCardCollection() {
  const context = useContext(CardCollectionContext);

  if (!context) {
    throw new Error('useCardCollection must be used within a CardCollectionProvider');
  }

  return context;
}

function createStyles(colors: PokemonColorPalette) {
  return {
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.screenBackground,
  },
};
}
