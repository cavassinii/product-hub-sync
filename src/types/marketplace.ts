export interface CategoryChannel {
  category_channel_id: string;
  category_id: number;
  channel_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface MercadoLivreCategory {
  mlId: string;
  name: string;
  parentMlId?: string | null;
  children?: MercadoLivreCategory[];
}

export interface SaveCategoryChannelRequest {
  category_channel_id: string;
  category_id: number;
  channel_id: number;
}

export const CHANNELS = {
  MERCADO_LIVRE: 1
} as const;