
import { LoginRequest, AuthResponse } from '@/types/auth';
import { Product, ProductResponse } from '@/types/product';
import { Category, CategoryResponse } from '@/types/category';
import { Brand, BrandResponse } from '@/types/brand';
import md5 from 'md5';

const API_BASE_URL = 'https://localhost:7020';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include', // Importante para CORS com credenciais
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const loginData = {
      Organization: credentials.Organization,
      User: credentials.User,
      Password: md5(credentials.Password)
    };

    const response = await this.request<AuthResponse>('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    this.setToken(response.token);
    localStorage.setItem('user_data', JSON.stringify({
      organization: credentials.Organization,
      user: credentials.User
    }));
    
    return response;
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/Products');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/api/Products/${id}`);
  }

  async saveProduct(product: Product): Promise<ProductResponse> {
    return this.request<ProductResponse>('/api/Products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/api/Products/${id}`, {
      method: 'POST',
    });
  }

  async sendProductToMercadoLivre(productId: number): Promise<any> {
    return this.request<any>(`/api/Products/${productId}/mercadolivre`, {
      method: 'POST',
    });
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/Categories');
  }

  async getCategory(id: number): Promise<Category> {
    return this.request<Category>(`/api/Categories/${id}`);
  }

  async saveCategory(category: Category): Promise<CategoryResponse> {
    return this.request<CategoryResponse>('/api/Categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/api/Categories/${id}`, {
      method: 'POST',
    });
  }

  // Subcategory endpoints
  async getSubcategories(): Promise<any[]> {
    return this.request<any[]>('/api/Subcategories');
  }

  async getSubcategory(id: number): Promise<any> {
    return this.request<any>(`/api/Subcategories/${id}`);
  }

  async saveSubcategory(subcategory: any): Promise<CategoryResponse> {
    return this.request<CategoryResponse>('/api/Subcategories', {
      method: 'POST',
      body: JSON.stringify(subcategory),
    });
  }

  async deleteSubcategory(id: number): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/api/Subcategories/${id}`, {
      method: 'POST',
    });
  }

  // Brand endpoints
  async getBrands(): Promise<Brand[]> {
    return this.request<Brand[]>('/api/Brands');
  }

  async getBrand(id: number): Promise<Brand> {
    return this.request<Brand>(`/api/Brands/${id}`);
  }

  async saveBrand(brand: Brand): Promise<BrandResponse> {
    return this.request<BrandResponse>('/api/Brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    });
  }

  async deleteBrand(id: number): Promise<BrandResponse> {
    return this.request<BrandResponse>(`/api/Brands/${id}`, {
      method: 'POST',
    });
  }

  // Mercado Livre categories
  async getMercadoLivreCategories(): Promise<any[]> {
    return this.request<any[]>('/api/MercadoLivre/categories');
  }
}

export const apiService = new ApiService();
