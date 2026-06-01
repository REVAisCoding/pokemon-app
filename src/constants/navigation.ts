import type { SFSymbol } from 'sf-symbols-typescript';

export const TAB_BAR_CENTER_BUTTON_SIZE = 56;

export type TabRouteName = 'index' | 'collection' | 'scan' | 'search' | 'profile';

export type TabItem = {
  name: TabRouteName;
  label: string;
  icon: SFSymbol;
  fallback: string;
  isCenter?: boolean;
};

export const TAB_ITEMS: TabItem[] = [
  { name: 'index', label: 'Início', icon: 'house', fallback: '⌂' },
  { name: 'collection', label: 'Coleção', icon: 'rectangle.stack', fallback: '🃏' },
  { name: 'scan', label: '', icon: 'camera', fallback: '📷', isCenter: true },
  { name: 'search', label: 'Buscar', icon: 'magnifyingglass', fallback: '⌕' },
  { name: 'profile', label: 'Perfil', icon: 'person', fallback: '👤' },
];
