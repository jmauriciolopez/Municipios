const DEFAULT_BASE_URL: string =
  typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL
    ? (import.meta as any).env.VITE_API_URL
    : 'http://localhost:4000/api/v1';

export type ApiClientOptions = { baseURL?: string };

export default class ApiClient {
  private baseURL: string;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || DEFAULT_BASE_URL;
  }

  private async request(path: string, opts: RequestInit = {}) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('municipio_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(opts.headers as Record<string, string>),
    };

    if (token) headers.Authorization = `Bearer ${token}`;

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
