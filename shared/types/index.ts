export type Area = {
  id: string;
  nombre: string;
  descripcion?: string;
};

export type Cuadrilla = {
  id: string;
  nombre: string;
  area_id: string;
  estado: 'disponible' | 'ocupada' | 'fuera_servicio';
  supervisor_id?: string;
};

export type Activo = {
  id: string;
  codigo: string;
  nombre: string;
  tipo_activo_id: string;
  estado: 'operativo' | 'en_mantenimiento' | 'fuera_servicio' | 'dado_de_baja';
  lat: number;
  lng: number;
  direccion?: string;
  area_responsable_id: string;
};

export type Incidente = {
  id: string;
  tipo: string;
  descripcion: string;
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  lat: number;
  lng: number;
  direccion?: string;
  area_id: string;
  activo_id?: string;
  riesgo_id?: string;
  reportado_por: string;
  fecha_reporte: string;
};

export type OrdenTrabajo = {
  id: string;
  codigo: string;
  incidente_id?: string;
  area_id?: string;
  cuadrilla_id?: string;
  estado: 'detectado' | 'asignado' | 'en_proceso' | 'resuelto' | 'verificado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  descripcion?: string;
  fecha_asignacion?: string;
  fecha_inicio?: string;
  fecha_cierre?: string;
};

export type Evidencia = {
  id: string;
  entidad_tipo: string;
  entidad_id: string;
  url: string;
  tipo: 'antes' | 'despues' | 'inspeccion' | 'intervencion';
  caption?: string;
  tomado_por: string;
  timestamp_foto: string;
};
