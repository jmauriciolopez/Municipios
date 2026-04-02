import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { AsignarCuadrillaDto } from './dto/asignar-cuadrilla.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';
import { OrdenEstado } from '../common/enums/orden-estado.enum';

@Injectable()
export class OrdenesTrabajoService {
  private ordenes: any[] = [];

  create(data: CreateOrdenTrabajoDto) {
    const now = new Date().toISOString();
    const orden = {
      id: `${Date.now()}`,
      ...data,
      estado: data.estado || OrdenEstado.DETECTADO,
      fecha_asignacion: data.fecha_asignacion || null,
      fecha_inicio: data.fecha_inicio || null,
      fecha_cierre: data.fecha_cierre || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    this.ordenes.push(orden);
    return orden;
  }

  findAll(query?: any) {
    const results = this.ordenes.filter((o) => !o.deleted_at);
    if (!query) return results;

    return results.filter((orden) => {
      if (query.estado && orden.estado !== query.estado) return false;
      if (query.prioridad && orden.prioridad !== query.prioridad) return false;
      if (query.area_id && orden.area_id !== query.area_id) return false;
      if (query.cuadrilla_id && orden.cuadrilla_id !== query.cuadrilla_id) return false;
      if (query.fecha_desde && new Date(orden.fecha_asignacion) < new Date(query.fecha_desde)) return false;
      if (query.fecha_hasta && new Date(orden.fecha_cierre || orden.fecha_inicio) > new Date(query.fecha_hasta)) return false;
      return true;
    });
  }

  findOne(id: string) {
    const orden = this.ordenes.find((item) => item.id === id && !item.deleted_at);
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }

  update(id: string, data: UpdateOrdenTrabajoDto) {
    const orden = this.findOne(id);
    Object.assign(orden, data, { updated_at: new Date().toISOString() });
    return orden;
  }

  asignarCuadrilla(id: string, data: AsignarCuadrillaDto) {
    const orden = this.findOne(id);
    orden.cuadrilla_id = data.cuadrilla_id;
    orden.fecha_asignacion = new Date().toISOString();
    orden.estado = OrdenEstado.ASIGNADO;
    orden.updated_at = new Date().toISOString();
    return orden;
  }

  cambiarEstado(id: string, data: CambiarEstadoOrdenDto) {
    const orden = this.findOne(id);

    if (data.estado === OrdenEstado.RESUELTO && orden.estado !== OrdenEstado.EN_PROCESO) {
      throw new BadRequestException('No se puede pasar a resuelto si no está en proceso');
    }
    if (data.estado === OrdenEstado.VERIFICADO && orden.estado !== OrdenEstado.RESUELTO) {
      throw new BadRequestException('No se puede verificar si no está resuelto');
    }

    orden.estado = data.estado;

    if (data.estado === OrdenEstado.EN_PROCESO) {
      orden.fecha_inicio = orden.fecha_inicio || new Date().toISOString();
    }

    if (data.estado === OrdenEstado.RESUELTO) {
      orden.fecha_cierre = new Date().toISOString();
    }

    orden.updated_at = new Date().toISOString();
    return orden;
  }

  getEvidencias(id: string) {
    this.findOne(id);
    return [];
  }

  calcularDuracion(orden: any) {
    const inicio = orden.fecha_inicio ? new Date(orden.fecha_inicio).getTime() : null;
    const cierre = orden.fecha_cierre ? new Date(orden.fecha_cierre).getTime() : null;
    const estimada = orden.fecha_cierre && orden.fecha_inicio ? Math.abs(cierre - inicio) / (1000 * 60 * 60) : null;

    const real = cierre && inicio ? estimada : null;
    return { estimada_horas: estimada, real_horas: real };
  }
}
