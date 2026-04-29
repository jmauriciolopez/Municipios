import { IncidenteEstado } from "../enums/incidente-estado.enum";
import { Prioridad } from "../../common/enums/prioridad.enum";

export class IncidenteEntity {
  id: string;
  tipo: string;
  descripcion: string;
  estado: IncidenteEstado;
  prioridad: Prioridad;
  lat: number;
  lng: number;
  direccion?: string;
  area_id: string;
  activo_id?: string;
  riesgo_id?: string;
  reportado_por: string;
  fecha_reporte: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
