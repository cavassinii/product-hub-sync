
export interface Brand {
  Id?: number;
  Name: string;
  Description?: string;
  Is_active: boolean;
  Created_at?: string;
  Updated_at?: string;
}

export interface BrandResponse {
  id: number;
}
