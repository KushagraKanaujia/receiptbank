/**
 * API Client for ReceiptBank Frontend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        message: response.statusText,
      }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    return response.json();
  }

  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) this.setToken(response.token);
    return response;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return this.request<{ user: any }>('/auth/me');
  }

  logout() {
    this.clearToken();
  }

  async getReceipts() {
    return this.request<{ receipts: any[] }>('/receipts');
  }

  async getReceiptStats() {
    return this.request<any>('/receipts/stats');
  }

  async getWithdrawals() {
    return this.request<{ withdrawals: any[] }>('/withdrawals');
  }
}

export const api = new APIClient(API_BASE_URL);
export default api;
