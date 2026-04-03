import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';

@Injectable()
export class UbicacionesService {
  constructor(private readonly prisma: PrismaService) {}

  findByEntidad(entidadTipo: string, entidadId: string) {
    return this.prisma.ubicacion.findMany({
      where: { entidadTipo, entidadId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(query?: { entidad_tipo?: string; entidad_id?: string }) {
    const where: any = {};
    if (query?.entidad_tipo) where.entidadTipo = query.entidad_tipo;
    if (query?.entidad_id) where.entidadId = query.entidad_id;
    return this.prisma.ubicacion.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  create(data: CreateUbicacionDto) {
    return this.prisma.ubicacion.create({ data: { entidadTipo: data.entidadTipo, entidadId: data.entidadId, lat: data.lat, lng: data.lng, direccion: data.direccion } });
  }
}
