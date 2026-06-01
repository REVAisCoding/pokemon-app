export type ScryfallImageUris = {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  art_crop?: string;
  border_crop?: string;
};

export type ScryfallCardFace = {
  name?: string;
  type_line?: string;
  image_uris?: ScryfallImageUris;
};

export type ScryfallPrices = {
  usd?: string | null;
  usd_foil?: string | null;
  usd_etched?: string | null;
  eur?: string | null;
  eur_foil?: string | null;
  tix?: string | null;
};

export type ScryfallCard = {
  object: 'card';
  id: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  rarity: string;
  type_line?: string;
  image_uris?: ScryfallImageUris;
  card_faces?: ScryfallCardFace[];
  prices?: ScryfallPrices;
  tcgplayer_id?: number;
  layout?: string;
};

export type ScryfallCardsResponse = {
  object: 'list';
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];
};

export type ScryfallErrorResponse = {
  object: 'error';
  code: string;
  details: string;
  status: number;
};
