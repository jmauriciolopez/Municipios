import ApiClient from './apiClient';
import { Cuadrilla } from '../types';

const api = new ApiClient();

export const getCuadrillas = async (params?: { area_id?: string; estado?: string }) => {
  const query = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k,v]) => v && query.append(k, String(v)));
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return api.get(`/cuadrillas${queryString}`) as Promise<Cuadrilla[]>;
};

export const getCuadrilla = async (id: string) => api.get(`/cuadrillas/${id}`) as Promise<Cuadrilla>;
export const createCuadrilla = async (payload: Partial<Cuadrilla>) => api.post('/cuadrillas', payload) as Promise<Cuadrilla>;
export const updateCuadrilla = async (id: string, payload: Partial<Cuadrilla>) => api.patch(`/cuadrillas/${id}`, payload) as Promise<Cuadrilla>;
export const setDisponibilidadCuadrilla = async (id: string, estado: string) => api.patch(`/cuadrillas/${id}/disponibilidad`, { estado }) as Promise<Cuadrilla>;
export const getOrdenesCuadrilla = async (id: string) => api.get(`/cuadrillas/${id}/ordenes`);
