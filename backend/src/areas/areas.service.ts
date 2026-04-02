import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAreaDto) {
    return this.prisma.area.create({
      data: {
        municipioId: data.municipioId,
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
      include: {
        municipio: true,
      },
    });
  }

  async findAll() {
    return this.prisma.area.findMany({
      where: { deletedAt: null },
      include: {
        municipio: true,
        cuadrillas: true,
        activos: true,
        riesgos: true,
        incidentes: true,
        ordenes: true,
      },
    });
  }

  async findOne(id: string) {
    const area = await this.prisma.area.findFirst({
      where: { id, deletedAt: null },
      include: {
        municipio: true,
        cuadrillas: true,
        activos: true,
        riesgos: true,
        incidentes: true,
        ordenes: true,
        inspecciones: true,
        inventario: true,
      },
    });
    if (!area) throw new NotFoundException('Área no encontrada');
    return area;
  }

  async update(id: string, data: UpdateAreaDto) {
    await this.findOne(id);

    return this.prisma.area.update({
      where: { id },
      data: {
        municipioId: data.municipioId,
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
      include: {
        municipio: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.area.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
