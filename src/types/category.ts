
export interface Category {
  Id?: number;
  Name: string;
  Parent_Id?: number | null;
  Is_Final: boolean;
  Created_At?: string;
  Updated_At?: string;
}

export interface CategoryResponse {
  id: number;
}
