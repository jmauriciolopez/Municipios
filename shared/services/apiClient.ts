const DEFAULT_BASE_URL = 'http://localhost:3000/api';

export type ApiClientOptions = { baseURL?: string; token?: string };

export default class ApiClient {
  private baseURL: string;
  private token?: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || DEFAULT_BASE_URL;
    this.token = options.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(path: string, opts: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(opts.headers as Record<string, string>),
    };

    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(`${this.baseURL}${path}`, { ...opts, headers });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  get(path: string) {
    return this.request(path, { method: 'GET' });
  }

  post(path: string, body: any) {
    return this.request(path, { method: 'POST', body: JSON.stringify(body) });
  }

  patch(path: string, body: any) {
    return this.request(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete(path: string) {
    return this.request(path, { method: 'DELETE' });
  }
}
