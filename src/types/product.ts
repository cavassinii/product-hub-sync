
export interface Product {
  Id?: number;
  Sku: string;
  Title: string;
  Description: string;
  Reference: string;
  Url_image1?: string;
  Url_image2?: string;
  Url_image3?: string;
  Url_image4?: string;
  Url_image5?: string;
  Ncm: string;
  Cest: string;
  Color: string;
  Size: string;
  Category1: string;
  Category2?: string;
  Category3?: string;
  Brand: string;
  Weight_gross: number;
  Weight_net: number;
  Width: number;
  Height: number;
  Unit: string;
  Is_active: boolean;
  Created_at?: string;
  Updated_at?: string;
}

export interface ProductResponse {
  id: number;
}
