import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  async register(data: { email: string; password: string; role?: string }) {
    return this.client.post('/auth/register', data);
  }

  async login(data: { email: string; password: string }) {
    return this.client.post('/auth/login', data);
  }

  async getProfile() {
    return this.client.get('/auth/me');
  }

  // OAuth endpoints
  async getConnectedServices() {
    return this.client.get('/oauth/connected');
  }

  async disconnectService(provider: string) {
    return this.client.delete(`/oauth/disconnect/${provider}`);
  }

  // Data endpoints
  async getData(provider: string, days: number = 30) {
    return this.client.get(`/data/${provider}`, { params: { days } });
  }

  async getAllData(days: number = 30) {
    return this.client.get('/data', { params: { days } });
  }

  // Marketplace endpoints
  async getMyRequests(status?: string) {
    return this.client.get('/marketplace/my-requests', { params: { status } });
  }

  async requestAccess(data: any) {
    return this.client.post('/marketplace/request-access', data);
  }

  async approvePermission(permissionId: string) {
    return this.client.patch(`/marketplace/permissions/${permissionId}/approve`);
  }

  async rejectPermission(permissionId: string) {
    return this.client.patch(`/marketplace/permissions/${permissionId}/reject`);
  }

  async revokePermission(permissionId: string) {
    return this.client.delete(`/marketplace/permissions/${permissionId}/revoke`);
  }

  async getEarnings() {
    return this.client.get('/marketplace/earnings');
  }

  // Sync endpoints
  async triggerSync(provider: string) {
    return this.client.post(`/sync/trigger/${provider}`);
  }

  async triggerSyncAll() {
    return this.client.post('/sync/trigger-all');
  }

  async getSyncStatus() {
    return this.client.get('/sync/status');
  }
}

export const api = new ApiClient();
