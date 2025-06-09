
export interface Category {
  Id?: number;
  Name: string;
  Description?: string;
  Is_active: boolean;
  Created_at?: string;
  Updated_at?: string;
}

export interface Subcategory {
  Id?: number;
  Name: string;
  Description?: string;
  CategoryId: number;
  MercadoLivreCategoryId?: string;
  MercadoLivreCategoryName?: string;
  Is_active: boolean;
  Created_at?: string;
  Updated_at?: string;
}

export interface CategoryResponse {
  id: number;
}
