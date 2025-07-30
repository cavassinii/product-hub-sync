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

export interface ProductIntegration {
  channel_Id: number;
  created_At: string;
  product_Channel_Id: string;
  product_Id: number;
  updated_At: string;
  product: {
    id: number;
    sku: string;
    title: string;
    description: string;
    reference: string;
    url_image1: string;
    url_image2: string;
    ncm: string;
    cest: string;
    category_id: number;
    weight_gross: number;
    weight_net: number;
    width: number;
    height: number;
    unit: string;
    is_active: boolean;
    cost_price: number;
    sale_price: number;
    stock: number;
  };
}

export const CHANNELS = {
  MERCADO_LIVRE: 1
} as const;

export const CHANNEL_NAMES = {
  [CHANNELS.MERCADO_LIVRE]: 'Mercado Livre'
} as const;