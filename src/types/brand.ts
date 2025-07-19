
export interface Brand {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandResponse {
  id: number;
}

// Tipos para requisições dos endpoints
export interface CreateBrandRequest {
  id: number;
  name: string;
}

export interface UpdateBrandRequest {
  id: number;
  name: string;
}

// Tipo para resposta de listagem
export interface BrandListResponse {
  success: boolean;
  data: Brand[];
  message?: string;
}

// Tipo para resposta individual
export interface BrandDetailResponse {
  success: boolean;
  data: Brand;
  message?: string;
}
