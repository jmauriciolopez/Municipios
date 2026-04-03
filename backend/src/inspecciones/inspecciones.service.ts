import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInspeccionDto } from './dto/create-inspeccion.dto';

const INCLUDE = { incidente: true, activo: true, inspector: { select: { id: true, nombre: true, email: true } }, area: true };

@Injectable()
export class InspeccionesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: { incidente_id?: string; activo_id?: string; area_id?: string; inspector_id?: string }) {
    const where: any = { deletedAt: null };
    if (query?.incidente_id) where.incidenteId = query.incidente_id;
    if (query?.activo_id) where.activoId = query.activo_id;
    if (query?.area_id) where.areaId = query.area_id;
    if (query?.inspector_id) where.inspectorId = query.inspector_id;
    return this.prisma.inspeccion.findMany({ where, include: INCLUDE, orderBy: { fechaInspeccion: 'desc' } });
  }

  async findOne(id: string) {
    const i = await this.prisma.inspeccion.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
    if (!i) throw new NotFoundException('Inspección no encontrada');
    return i;
  }

  create(data: CreateInspeccionDto) {
    return this.prisma.inspeccion.create({
      data: {
        incidenteId: data.incidenteId, activoId: data.activoId,
        inspectorId: data.inspectorId, areaId: data.areaId,
        resultado: data.resultado, observaciones: data.observaciones,
        fechaInspeccion: data.fechaInspeccion ? new Date(data.fechaInspeccion) : new Date(),
      },
      include: INCLUDE,
    });
  }

  async update(id: string, data: Partial<CreateInspeccionDto>) {
    await this.findOne(id);
    return this.prisma.inspeccion.update({
      where: { id },
      data: {
        activoId: data.activoId,
        inspectorId: data.inspectorId,
        areaId: data.areaId,
        resultado: data.resultado,
        observaciones: data.observaciones,
        fechaInspeccion: data.fechaInspeccion ? new Date(data.fechaInspeccion) : undefined,
      },
      include: INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inspeccion.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
