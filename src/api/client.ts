// Simple API client wrapper for fetch with JSON, error mapping, and auth token support
export interface ApiError extends Error {
  status?: number;
  code?: string;
}

const BASE_URL = '/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
}

export function loadStoredToken() {
  const t = localStorage.getItem('admin_token');
  if (t) authToken = t;
  return authToken;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean; // force attach auth even if not set
}

export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...options.headers,
  };
  let body: BodyInit | undefined;
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    body = options.body; // browser sets multipart boundary
  }
  const token = authToken || loadStoredToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: options.method || (options.body ? 'POST' : 'GET'), headers, body });
  const text = await res.text();
  let data: any = undefined;
  try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }
  if (!res.ok) {
    const err: ApiError = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    if (data?.error) err.code = data.error;
    throw err;
  }
  return data as T;
}

// Convenience endpoint helpers
export const api = {
  auth: {
    login: async (email: string, password: string) => apiFetch<{ token: string; role: string; email: string }>('auth/login', { body: { email, password } }),
  },
  home: () => apiFetch('/home'),
  services: () => apiFetch('/services'),
  about: () => apiFetch('/about'),
  team: () => apiFetch('/team'),
  contact: () => apiFetch('/contact'),
  articles: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString();
    return apiFetch(`/articles${qs ? `?${qs}` : ''}`);
  },
  categories: () => apiFetch('/categories'),
  tags: () => apiFetch('/tags'),
  videos: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString();
    return apiFetch(`/videos${qs ? `?${qs}` : ''}`);
  },
  videoCategories: () => apiFetch('/video-categories'),
  bookings: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString();
    return apiFetch(`/bookings${qs ? `?${qs}` : ''}`);
  },
  clients: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString();
    return apiFetch(`/clients${qs ? `?${qs}` : ''}`);
  },
  messages: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString();
    return apiFetch(`/messages${qs ? `?${qs}` : ''}`);
  },
  settings: () => apiFetch('/settings'),
  newsletter: () => apiFetch('/newsletter'),
};

// Generic hook helpers (minimal, avoids external libs)
import { useEffect, useState } from 'react';
export function useApi<T>(factory: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    factory().then(d => { if (!cancelled) { setData(d); setLoading(false); } }).catch(e => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error, loading };
}
