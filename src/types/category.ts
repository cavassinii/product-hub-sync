
export interface Category {
  id: number;
  name: string;
  parent_Id?: number | null;
  is_Final: boolean;
  created_At?: string;
  updated_At?: string;
}

export interface CategoryResponse {
  id: number;
}

// Tipos para requisições dos endpoints
export interface CreateCategoryRequest {
  id: number;
  name: string;
  parent_Id?: number | null;
  is_Final: boolean;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
  parent_Id?: number | null;
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
