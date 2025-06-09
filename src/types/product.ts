export interface Product {
  id: number;
  sku: string;
  title: string;
  description: string;
  reference: string;
  url_image1: string;
  url_image2: string;
  url_image3: string;
  url_image4: string;
  url_image5: string;
  ncm: string;
  cest: string;
  color: string;
  size: string;
  category1: string;
  category2: string;
  category3: string;
  brand: string;
  weight_gross: number;
  weight_net: number;
  width: number;
  height: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
}
