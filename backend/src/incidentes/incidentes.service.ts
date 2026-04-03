import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { FindIncidentesQueryDto } from './dto/find-incidentes-query.dto';

@Injectable()
export class IncidentesService {
  constructor(
    private prisma: PrismaService,
    private auditoria: AuditoriaService,
  ) {}

  async create(data: CreateIncidenteDto, userId?: string) {
    const incidente = await this.prisma.incidente.create({
      data: {
        tipo: data.tipo,
        descripcion: data.descripcion ?? '',
        estado: data.estado ?? 'abierto',
        prioridad: data.prioridad ?? 'media',
        lat: data.lat,
        lng: data.lng,
        direccion: data.direccion,
        areaId: data.area_id,
        activoId: data.activo_id,
        riesgoId: data.riesgo_id,
        reportadoPor: data.reportado_por ?? userId,
        fechaReporte: data.fecha_reporte ? new Date(data.fecha_reporte) : new Date(),
      },
    });

    if (userId) {
      await this.auditoria.logEvent('incidente', incidente.id, 'CREATE', userId, data);
    }

    return incidente;
  }

  async findAll(query: FindIncidentesQueryDto) {
    const where: any = { deletedAt: null };
    if (query.estado) where.estado = query.estado;
    if (query.prioridad) where.prioridad = query.prioridad;
    if (query.area_id) where.areaId = query.area_id;
    if (query.fecha_desde) where.fechaReporte = { gte: new Date(query.fecha_desde) };
    if (query.fecha_hasta) where.fechaReporte = { ...where.fechaReporte, lte: new Date(query.fecha_hasta) };

    return this.prisma.incidente.findMany({
      where,
      include: {
        area: true,
        activo: true,
        riesgo: true,
        reportadoPorU: true,
        orden: true,
      },
    });
  }

  async findOne(id: string) {
    const incidente = await this.prisma.incidente.findUnique({
      where: { id, deletedAt: null },
      include: {
        area: true,
        activo: true,
        riesgo: true,
        reportadoPorU: true,
        orden: true,
      },
    });
    if (!incidente) throw new NotFoundException('Incidente no encontrado');
    return incidente;
  }

  async update(id: string, data: UpdateIncidenteDto, userId?: string) {
    const payload: any = {};
    if (data.tipo !== undefined) payload.tipo = data.tipo;
    if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
    if (data.estado !== undefined) payload.estado = data.estado;
    if (data.prioridad !== undefined) payload.prioridad = data.prioridad;
    if (data.lat !== undefined) payload.lat = data.lat;
    if (data.lng !== undefined) payload.lng = data.lng;
    if (data.direccion !== undefined) payload.direccion = data.direccion;
    if (data.area_id !== undefined) payload.areaId = data.area_id;
    if (data.activo_id !== undefined) payload.activoId = data.activo_id;
    if (data.riesgo_id !== undefined) payload.riesgoId = data.riesgo_id;
    if (data.fecha_reporte !== undefined) payload.fechaReporte = new Date(data.fecha_reporte);

    const incidente = await this.prisma.incidente.update({
      where: { id },
      data: payload,
      include: { area: true, activo: true, riesgo: true, reportadoPorU: true, orden: true },
    });

    if (userId) {
      await this.auditoria.logEvent('incidente', id, 'UPDATE', userId, data);
    }

    return incidente;
  }

  async remove(id: string, userId?: string) {
    const incidente = await this.findOne(id);
    await this.prisma.incidente.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'cancelado' },
    });

    if (userId) {
      await this.auditoria.logEvent('incidente', id, 'DELETE', userId);
    }

    return { deleted: true, id };
  }

  async convertToOrden(id: string, userId?: string) {
    const incidente = await this.findOne(id);

    const result = await this.prisma.$transaction(async (tx) => {
      // Update incidente status
      await tx.incidente.update({
        where: { id },
        data: { estado: 'en_proceso' },
      });

      // Create orden de trabajo
      const orden = await tx.ordenTrabajo.create({
        data: {
          incidenteId: incidente.id,
          areaId: incidente.areaId,
          estado: 'detectado',
          prioridad: incidente.prioridad,
          descripcion: incidente.descripcion,
          codigo: `ORD-${Date.now()}`,
        },
      });

      return orden;
    });

    if (userId) {
      await this.auditoria.logEvent('incidente', id, 'CONVERT_TO_ORDER', userId, { ordenId: result.id });
    }

    return result;
  }

  async getEvidencias(id: string) {
    await this.findOne(id);
    return this.prisma.evidencia.findMany({
      where: { entidadTipo: 'incidente', entidadId: id },
    });
  }
}

