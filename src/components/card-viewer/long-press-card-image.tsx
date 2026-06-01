import { Image, type ImageContentFit, type ImageStyle } from 'expo-image';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { type CardGameType } from '@/types/cardGame';
import { getCardRarity } from '@/utils/card-rarity';
import { openCardViewer } from '@/utils/openCardViewer';

const LONG_PRESS_DELAY_MS = 450;

type LongPressCardImageProps = {
  imageUrl: string;
  name?: string;
  cardId?: string;
  gameType?: CardGameType;
  rarity?: string;
  rawData?: Record<string, unknown>;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  accessibilityLabel?: string;
};

export function LongPressCardImage({
  imageUrl,
  name,
  cardId,
  gameType,
  rarity,
  rawData,
  style,
  imageStyle,
  contentFit = 'cover',
  accessibilityLabel,
}: LongPressCardImageProps) {
  return (
    <Pressable
      style={style}
      onLongPress={() => {
        const resolvedRarity = getCardRarity({ rarity, rawData });

        openCardViewer({
          imageUrl,
          name,
          cardId,
          gameType,
          ...(resolvedRarity ? { rarity: resolvedRarity } : {}),
        });
      }}
      delayLongPress={LONG_PRESS_DELAY_MS}
      accessibilityRole="button"
      accessibilityHint="Pressione e segure para visualizar a carta em tela cheia"
      accessibilityLabel={accessibilityLabel ?? `Pressione e segure para visualizar ${name ?? 'carta'}`}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, imageStyle]}
        contentFit={contentFit}
        transition={200}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
