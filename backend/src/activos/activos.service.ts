import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';
import { ActivoEstado } from '../common/enums/activo-estado.enum';

@Injectable()
export class ActivosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateActivoDto) {
    return this.prisma.activo.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        tipoActivoId: data.tipoActivoId,
        municipioId: data.municipioId,
        estado: data.estado ?? ActivoEstado.OPERATIVO,
        lat: data.lat ? data.lat : null,
        lng: data.lng ? data.lng : null,
        direccion: data.direccion,
        areaResponsableId: data.areaResponsableId,
      },
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
      },
    });
  }

  async findAll(query?: any) {
    const where: any = { deletedAt: null };

    if (query?.estado) where.estado = query.estado;
    if (query?.tipo_activo_id) where.tipoActivoId = query.tipo_activo_id;
    if (query?.area_responsable_id) where.areaResponsableId = query.area_responsable_id;
    if (query?.municipio_id) where.municipioId = query.municipio_id;

    return this.prisma.activo.findMany({
      where,
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
      },
    });
  }

  async findOne(id: string) {
    const activo = await this.prisma.activo.findFirst({
      where: { id, deletedAt: null },
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
        incidentes: true,
        inspecciones: true,
      },
    });
    if (!activo) throw new NotFoundException('Activo no encontrado');
    return activo;
  }

  async update(id: string, data: UpdateActivoDto) {
    await this.findOne(id);

    return this.prisma.activo.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        tipoActivoId: data.tipoActivoId,
        municipioId: data.municipioId,
        estado: data.estado,
        lat: data.lat ? data.lat : null,
        lng: data.lng ? data.lng : null,
        direccion: data.direccion,
        areaResponsableId: data.areaResponsableId,
      },
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
      },
    });
  }

  async findNearby(query: { lat?: number; lng?: number; radio?: number }) {
    if (!query.lat || !query.lng || !query.radio) {
      return this.findAll();
    }

    // For simplicity, return all for now. In real implementation, use PostGIS or similar for spatial queries.
    return this.prisma.activo.findMany({
      where: { deletedAt: null },
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
      },
    });
  }
}
