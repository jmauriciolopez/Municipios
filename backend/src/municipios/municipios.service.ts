import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMunicipioDto } from './dto/create-municipio.dto';

@Injectable()
export class MunicipiosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.municipio.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { areas: true, usuarios: true, activos: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const m = await this.prisma.municipio.findFirst({ where: { id, deletedAt: null }, include: { areas: true, _count: { select: { usuarios: true, activos: true, incidentes: true } } } });
    if (!m) throw new NotFoundException('Municipio no encontrado');
    return m;
  }

  create(data: CreateMunicipioDto) { return this.prisma.municipio.create({ data }); }

  async update(id: string, data: Partial<CreateMunicipioDto>) {
    await this.findOne(id);
    return this.prisma.municipio.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.municipio.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
