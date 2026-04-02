export type Incident = {
  id: string;
  tipo: string;
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  area: string;
  lat: number;
  lng: number;
  direccion: string;
  fecha: string;
};
