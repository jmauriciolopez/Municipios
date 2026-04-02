import ApiClient from './apiClient';
import { Incidente } from '../types';

const api = new ApiClient();

export const getIncidentes = async () => {
  return api.get('/incidentes') as Promise<Incidente[]>;
};

export const getIncidente = async (id: string) => {
  return api.get(`/incidentes/${id}`) as Promise<Incidente>;
};

export const createIncidente = async (payload: Partial<Incidente>) => {
  return api.post('/incidentes', payload) as Promise<Incidente>;
};

export const updateIncidente = async (id: string, payload: Partial<Incidente>) => {
  return api.patch(`/incidentes/${id}`, payload) as Promise<Incidente>;
};

export const deleteIncidente = async (id: string) => {
  return api.delete(`/incidentes/${id}`);
};
