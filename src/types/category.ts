
export interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  is_final: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryResponse {
  id: number;
}

// Tipos para requisições dos endpoints
export interface CreateCategoryRequest {
  id: number;
  name: string;
  parent_id?: number | null;
  is_Final: boolean;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
  parent_id?: number | null;
  is_Final: boolean;
}

// Tipo para resposta de listagem
export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

// Tipo para resposta individual
export interface CategoryDetailResponse {
  success: boolean;
  data: Category;
  message?: string;
}
