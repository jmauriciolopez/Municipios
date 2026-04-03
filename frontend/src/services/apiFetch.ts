const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

function getToken(): string | null {
  return localStorage.getItem('municipio_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE.replace(/\/$/, '')}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`API ${res.status}`);
  if (res.status === 204) return null as T;
  return res.json();
}
