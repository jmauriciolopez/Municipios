import ApiClient from './apiClient';
import { Activo } from '../types';

const api = new ApiClient();

export const getActivos = async (params?: { tipo?: string; estado?: string; area_id?: string }) => {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => v && query.append(k, String(v)));
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return api.get(`/activos${queryString}`) as Promise<Activo[]>;
};

export const getActivo = async (id: string) => api.get(`/activos/${id}`) as Promise<Activo>;
export const createActivo = async (payload: Partial<Activo>) => api.post('/activos', payload) as Promise<Activo>;
export const updateActivo = async (id: string, payload: Partial<Activo>) => api.patch(`/activos/${id}`, payload) as Promise<Activo>;
export const getActivosCercanos = async (lat: number, lng: number, radio: number) => api.get(`/activos/cercanos?lat=${lat}&lng=${lng}&radio=${radio}`) as Promise<Activo[]>;
