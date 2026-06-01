export type HomeStat = {
  id: string;
  label: string;
  value: string;
  icon: 'cards' | 'unique' | 'duplicates' | 'sets' | 'rares' | 'value';
};

export type RecentCard = {
  id: string;
  name: string;
  setName: string;
  number: string;
  quantity: number;
  accentColor: string;
};

export type CollectionSet = {
  id: string;
  name: string;
  progress: string;
  backgroundColor: string;
  labelColor: string;
  abbreviation: string;
};

export const HOME_USER = {
  name: 'Zagreu',
  subtitle: 'Sua coleção de cartas Pokémon',
} as const;

export const HOME_STATS: HomeStat[] = [
  { id: 'cards', label: 'Cartas', value: '124', icon: 'cards' },
  { id: 'sets', label: 'Sets', value: '37', icon: 'sets' },
  { id: 'rares', label: 'Raras', value: '12', icon: 'rares' },
  { id: 'value', label: 'Valor estimado', value: 'R$ 2.450', icon: 'value' },
];

export const RECENT_CARDS: RecentCard[] = [
  {
    id: 'pikachu',
    name: 'Pikachu',
    setName: 'Base Set',
    number: '#58/102',
    quantity: 1,
    accentColor: '#F7D046',
  },
  {
    id: 'charizard',
    name: 'Charizard',
    setName: 'Base Set',
    number: '#4/102',
    quantity: 1,
    accentColor: '#FF6B4A',
  },
  {
    id: 'blastoise',
    name: 'Blastoise',
    setName: 'Base Set',
    number: '#2/102',
    quantity: 2,
    accentColor: '#4A90D9',
  },
  {
    id: 'mewtwo',
    name: 'Mewtwo',
    setName: 'Base Set',
    number: '#10/102',
    quantity: 1,
    accentColor: '#B388FF',
  },
];

export const COLLECTION_SETS: CollectionSet[] = [
  {
    id: 'base-set',
    name: 'Base Set',
    progress: '102/102',
    backgroundColor: '#FFE8A3',
    labelColor: '#1A1A2E',
    abbreviation: 'BS',
  },
  {
    id: 'jungle',
    name: 'Jungle',
    progress: '64/64',
    backgroundColor: '#C8F0C8',
    labelColor: '#1A1A2E',
    abbreviation: 'JU',
  },
  {
    id: 'fossil',
    name: 'Fossil',
    progress: '62/62',
    backgroundColor: '#FFD6A5',
    labelColor: '#1A1A2E',
    abbreviation: 'FO',
  },
  {
    id: 'team-rocket',
    name: 'Team Rocket',
    progress: '83/83',
    backgroundColor: '#E8D4FF',
    labelColor: '#1A1A2E',
    abbreviation: 'TR',
  },
];
