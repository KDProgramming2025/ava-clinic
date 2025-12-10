import type { VideoStatus } from '../utils/videoMedia';

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
    login: async (identifier: string, password: string) =>
      apiFetch<{ token: string; user: { id: string; email?: string; username?: string; role?: string } }>('auth/login', { body: { identifier, password } }),
    me: async () => apiFetch<{ user: { id: string; email?: string; username?: string; role?: string; name?: string; active?: boolean } }>('auth/me'),
  },
  home: () => apiFetch('/home'),
  services: (params: Record<string, any> = {}) => {
    const merged = { includeTranslations: '1', ...params };
    const qs = new URLSearchParams(
      Object.entries(merged)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    return apiFetch(`/services${qs ? `?${qs}` : ''}`);
  },
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
  importInstagramVideo: (url: string, status: VideoStatus = 'DRAFT') =>
    apiFetch('/videos/import', { body: { url, status } }),
  createVideo: (body: any) => apiFetch('/videos', { body }),
  updateVideo: (id: string, body: any) => apiFetch(`/videos/${id}`, { method: 'PUT', body }),
  deleteVideo: (id: string) => apiFetch(`/videos/${id}`, { method: 'DELETE' }),
  reorderVideos: (items: { id: string; order: number }[]) => apiFetch('/videos/reorder', { method: 'PUT', body: { items } }),
  videoCategories: () => apiFetch('/video-categories'),
  bookings: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString();
    return apiFetch(`/bookings${qs ? `?${qs}` : ''}`);
  },
  bookingConfig: () => apiFetch('/booking-config'),
  availability: (date: string, serviceId?: string) => {
    const qs = new URLSearchParams({ date, ...(serviceId ? { serviceId } : {}) }).toString();
    return apiFetch<string[]>(`/booking-config/availability?${qs}`);
  },
  bookingInfo: () => apiFetch('/booking-info'),
  createBookingInfo: (body: any) => apiFetch('/booking-info', { body }),
  updateBookingInfo: (id: string, body: any) => apiFetch(`/booking-info/${id}`, { method: 'PUT', body }),
  deleteBookingInfo: (id: string) => apiFetch(`/booking-info/${id}`, { method: 'DELETE' }),
  reorderBookingInfo: (items: { id: string; order: number }[]) => apiFetch('/booking-info', { method: 'PUT', body: items }),
  clients: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString();
    return apiFetch(`/clients${qs ? `?${qs}` : ''}`);
  },
  createClient: (body: any) => apiFetch('/clients', { body }),
  createBooking: (body: any) => apiFetch('/bookings', { body }),
  messages: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null)).toString();
    return apiFetch(`/messages${qs ? `?${qs}` : ''}`);
  },
  settings: () => apiFetch('/settings'),
  newsletter: () => apiFetch('/newsletter'),
  instagram: {
    status: () => apiFetch('/instagram/status'),
    loginUrl: () => apiFetch('/instagram/login-url'),
    disconnect: () => apiFetch('/instagram/disconnect', { method: 'POST' }),
    feed: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)])
      ).toString();
      return apiFetch(`/instagram/feed${qs ? `?${qs}` : ''}`);
    },
  },
  instagramWidget: {
    get: () => apiFetch<{ embedUrl: string | null }>('/instagram-widget'),
    update: (embedUrl: string | null) => apiFetch<{ embedUrl: string | null }>('/instagram-widget', {
      method: 'PUT',
      body: { embedUrl },
    }),
  },
  // SEO
  seoJsonLd: (path: string) => apiFetch('/seo/jsonld?'+ new URLSearchParams({ path }).toString()),
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
