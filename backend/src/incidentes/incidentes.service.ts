import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { FindIncidentesQueryDto } from './dto/find-incidentes-query.dto';

@Injectable()
export class IncidentesService {
  private incidentes: any[] = [];

  create(data: CreateIncidenteDto) {
    const now = new Date().toISOString();
    const incidente = {
      id: `${Date.now()}`,
      ...data,
      fecha_reporte: data.fecha_reporte ?? now,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    this.incidentes.push(incidente);
    return incidente;
  }

  findAll(query: FindIncidentesQueryDto) {
    return this.incidentes.filter((incidente) => {
      if (incidente.deleted_at) return false;
      if (query.estado && incidente.estado !== query.estado) return false;
      if (query.prioridad && incidente.prioridad !== query.prioridad) return false;
      if (query.area_id && incidente.area_id !== query.area_id) return false;
      if (query.fecha_desde && new Date(incidente.fecha_reporte) < new Date(query.fecha_desde)) return false;
      if (query.fecha_hasta && new Date(incidente.fecha_reporte) > new Date(query.fecha_hasta)) return false;
      return true;
    });
  }

  findOne(id: string) {
    const incidente = this.incidentes.find((item) => item.id === id && !item.deleted_at);
    if (!incidente) throw new NotFoundException('Incidente no encontrado');
    return incidente;
  }

  update(id: string, data: UpdateIncidenteDto) {
    const incidente = this.findOne(id);
    Object.assign(incidente, data, { updated_at: new Date().toISOString() });
    return incidente;
  }

  remove(id: string) {
    const incidente = this.findOne(id);
    incidente.deleted_at = new Date().toISOString();
    incidente.estado = 'cancelado';
    return { deleted: true, id };
  }

  convertToOrden(id: string) {
    const incidente = this.findOne(id);
    incidente.estado = 'en_proceso';
    incidente.updated_at = new Date().toISOString();

    const orden = {
      id: `orden-${Date.now()}`,
      incidente_id: incidente.id,
      area_id: incidente.area_id,
      estado: 'detectado',
      prioridad: incidente.prioridad,
      descripcion: incidente.descripcion,
      fecha_asignacion: null,
      fecha_inicio: null,
      fecha_cierre: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return orden;
  }

  getEvidencias(id: string) {
    this.findOne(id);
    return [];
  }
}

