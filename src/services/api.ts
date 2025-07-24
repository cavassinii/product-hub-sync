
import { LoginRequest, AuthResponse } from '@/types/auth';
import { Product, ProductResponse } from '@/types/product';
import { Category, CategoryResponse } from '@/types/category';
import { Brand, BrandResponse } from '@/types/brand';
import { CategoryChannel, MercadoLivreCategory, SaveCategoryChannelRequest } from '@/types/marketplace';
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
    // Sempre pega o token mais recente do localStorage
    this.token = localStorage.getItem('auth_token');

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
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        // Se não for JSON, tenta pegar texto
        try {
          errorData = await response.text();
        } catch {}
      }
      // Log detalhado do erro
      console.error('Erro na requisição:', {
        url: `${API_BASE_URL}${url}`,
        status: response.status,
        errorData
      });
      throw new Error(errorData?.message || errorData || `HTTP error! status: ${response.status}`);
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
      method: 'DELETE',
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
      method: 'DELETE',
    });
  }

  // Mercado Livre categories
  async getMercadoLivreCategories(): Promise<any[]> {
    return this.request<any[]>('/api/MercadoLivre/categories');
  }

  // Category Channels endpoints
  async getCategoryChannel(categoryId: number, channelId: number): Promise<CategoryChannel | null> {
    try {
      return await this.request<CategoryChannel>(`/api/CategoriesChannels/GetByCategoryAndChannel?categoryId=${categoryId}&channelId=${channelId}`);
    } catch (error: any) {
      // Log do erro para debug
      console.error('Erro em getCategoryChannel:', error);
      // Se retornar 404 ou mensagem específica, significa que não existe vínculo
      if (
        error?.message === 'Associação categoria-canal não encontrada.' ||
        error?.message?.toLowerCase().includes('associação categoria-canal não encontrada')
      ) {
        return null;
      }
      return null;
    }
  }

  async saveCategoryChannel(data: SaveCategoryChannelRequest): Promise<any> {
    return this.request<any>('/api/CategoriesChannels/SaveCategoryChannel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Mercado Livre category tree
  async getMercadoLivreCategoryTree(): Promise<MercadoLivreCategory> {
    return this.request<MercadoLivreCategory>('/api/MercadoLivre/GetCategoryTree');
  }
}

export const apiService = new ApiService();
