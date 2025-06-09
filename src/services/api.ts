
import { LoginRequest, AuthResponse } from '@/types/auth';
import { Product, ProductResponse } from '@/types/product';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-url.com';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
    const response = await this.request<AuthResponse>('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
}

export const apiService = new ApiService();
