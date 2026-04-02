import ApiClient from './apiClient';
import { OrdenTrabajo } from '../types';

const api = new ApiClient();

export const getOrdenes = async () => api.get('/ordenes-trabajo') as Promise<OrdenTrabajo[]>;
export const getOrden = async (id: string) => api.get(`/ordenes-trabajo/${id}`) as Promise<OrdenTrabajo>;
export const createOrden = async (payload: Partial<OrdenTrabajo>) => api.post('/ordenes-trabajo', payload) as Promise<OrdenTrabajo>;
export const updateOrden = async (id: string, payload: Partial<OrdenTrabajo>) => api.patch(`/ordenes-trabajo/${id}`, payload) as Promise<OrdenTrabajo>;
export const asignarCuadrilla = async (id: string, cuadrilla_id: string) => api.patch(`/ordenes-trabajo/${id}/asignar-cuadrilla`, { cuadrilla_id }) as Promise<OrdenTrabajo>;
export const cambiarEstadoOrden = async (id: string, estado: string) => api.patch(`/ordenes-trabajo/${id}/cambiar-estado`, { estado }) as Promise<OrdenTrabajo>;
