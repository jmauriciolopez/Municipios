const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.API_BASE_URL) ||
  'http://localhost:3000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }
  return response.json();
};

export const fetchOrdenes = async () => {
  const res = await fetch(`${API_BASE_URL}/ordenes-trabajo`);
  return handleResponse(res);
};

export const fetchIncidentes = async () => {
  const res = await fetch(`${API_BASE_URL}/incidentes`);
  return handleResponse(res);
};

export const uploadEvidence = async (ordenId: string, data: FormData) => {
  const res = await fetch(`${API_BASE_URL}/ordenes-trabajo/${ordenId}/evidencias`, {
    method: 'POST',
    body: data,
  });
  return handleResponse(res);
};
