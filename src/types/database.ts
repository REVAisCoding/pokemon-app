export type UserCardRow = {
  id: string;
  user_id: string;
  card_api_id: string;
  name: string;
  set: string;
  number: string;
  type: string;
  image_url: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type UserCardInsert = Omit<UserCardRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserCardUpdate = Partial<
  Pick<UserCardRow, 'name' | 'set' | 'number' | 'type' | 'image_url' | 'quantity' | 'updated_at'>
>;

export type Database = {
  public: {
    Tables: {
      user_cards: {
        Row: UserCardRow;
        Insert: UserCardInsert;
        Update: UserCardUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
