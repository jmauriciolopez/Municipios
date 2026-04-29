import { OrdenEstado } from "../../common/enums/orden-estado.enum";
import { Prioridad } from "../../common/enums/prioridad.enum";

export class OrdenTrabajoEntity {
  id: string;
  codigo: string;
  incidente_id?: string;
  area_id?: string;
  cuadrilla_id?: string;
  estado: OrdenEstado;
  prioridad: Prioridad;
  descripcion?: string;
  fecha_asignacion?: string;
  fecha_inicio?: string;
  fecha_cierre?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
