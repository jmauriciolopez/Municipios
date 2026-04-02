import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { FindIncidentesQueryDto } from './dto/find-incidentes-query.dto';

@Injectable()
export class IncidentesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateIncidenteDto) {
    return this.prisma.incidente.create({
      data: {
        ...data,
        fechaReporte: data.fecha_reporte ?? new Date(),
      },
    });
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

  async update(id: string, data: UpdateIncidenteDto) {
    return this.prisma.incidente.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const incidente = await this.findOne(id);
    await this.prisma.incidente.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'cancelado' },
    });
    return { deleted: true, id };
  }

  async convertToOrden(id: string) {
    const incidente = await this.findOne(id);
    await this.prisma.incidente.update({
      where: { id },
      data: { estado: 'en_proceso' },
    });

    const orden = await this.prisma.ordenTrabajo.create({
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
  }

  async getEvidencias(id: string) {
    await this.findOne(id);
    return this.prisma.evidencia.findMany({
      where: { entidadTipo: 'incidente', entidadId: id },
    });
  }
}

