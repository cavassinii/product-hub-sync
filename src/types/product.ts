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
  category_id: number | string;
  brand_id: number | string;
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

// Tipos para requisições dos endpoints
export interface CreateProductRequest {
  sku: string;
  title: string;
  description: string;
  reference?: string;
  url_image1?: string;
  url_image2?: string;
  url_image3?: string;
  url_image4?: string;
  url_image5?: string;
  ncm?: string;
  cest?: string;
  color?: string;
  size?: string;
  category_id: number;
  brand_id: number;
  weight_gross?: number;
  weight_net?: number;
  width?: number;
  height?: number;
  unit?: string;
  is_active?: boolean;
}

export interface UpdateProductRequest {
  id: number;
  sku: string;
  title: string;
  description: string;
  reference?: string;
  url_image1?: string;
  url_image2?: string;
  url_image3?: string;
  url_image4?: string;
  url_image5?: string;
  ncm?: string;
  cest?: string;
  color?: string;
  size?: string;
  category_id: number;
  brand_id: number;
  weight_gross?: number;
  weight_net?: number;
  width?: number;
  height?: number;
  unit?: string;
  is_active?: boolean;
}

// Tipo para resposta de listagem
export interface ProductListResponse {
  success: boolean;
  data: Product[];
  message?: string;
}

// Tipo para resposta individual
export interface ProductDetailResponse {
  success: boolean;
  data: Product;
  message?: string;
}
