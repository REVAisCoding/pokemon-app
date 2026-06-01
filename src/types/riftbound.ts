export type RiftboundCardSet = {
  set_id: string;
  label: string;
};

export type RiftboundCardClassification = {
  type: string;
  supertype: string | null;
  rarity: string;
  domain: string[];
};

export type RiftboundCard = {
  id: string;
  name: string;
  riftbound_id: string;
  tcgplayer_id?: string;
  collector_number: number;
  attributes: {
    energy: number | null;
    might: number | null;
    power: number | null;
  };
  classification: RiftboundCardClassification;
  text: {
    rich: string;
    plain: string;
    flavour: string | null;
  };
  set: RiftboundCardSet;
  media: {
    image_url: string;
    artist?: string;
  };
  tags: string[];
  metadata?: {
    clean_name?: string;
    updated_on?: string;
    alternate_art?: boolean;
    overnumbered?: boolean;
    signature?: boolean;
  };
};

export type RiftboundCardsResponse = {
  items: RiftboundCard[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type RiftboundSet = {
  id: string;
  name: string;
  set_id: string;
  card_count: number;
  published_on?: string;
};
