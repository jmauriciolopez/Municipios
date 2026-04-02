import ApiClient from './apiClient';

const api = new ApiClient();

export const getResumen = async () => api.get('/dashboard/resumen');
export const getIncidentesPorEstado = async () => api.get('/dashboard/incidentes-por-estado');
export const getOrdenesPorArea = async () => api.get('/dashboard/ordenes-por-area');
export const getTiemposResolucion = async () => api.get('/dashboard/tiempos-resolucion');
export const getMapaCalor = async (params: { fecha_desde?: string; fecha_hasta?: string; tipo?: string }) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v) query.append(k, v); });
  return api.get(`/dashboard/mapa-calor?${query.toString()}`);
};
