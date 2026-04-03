import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRiesgoDto } from './dto/create-riesgo.dto';

@Injectable()
export class RiesgosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: { area_id?: string; nivel?: string }) {
    const where: any = {};
    if (query?.area_id) where.areaId = query.area_id;
    if (query?.nivel) where.nivel = Number(query.nivel);
    return this.prisma.riesgo.findMany({ where, include: { area: true, _count: { select: { incidentes: true } } }, orderBy: { nivel: 'desc' } });
  }

  async findOne(id: string) {
    const r = await this.prisma.riesgo.findUnique({ where: { id }, include: { area: true, incidentes: { take: 5, orderBy: { fechaReporte: 'desc' } } } });
    if (!r) throw new NotFoundException('Riesgo no encontrado');
    return r;
  }

  create(data: CreateRiesgoDto) {
    return this.prisma.riesgo.create({ data, include: { area: true } });
  }

  async update(id: string, data: Partial<CreateRiesgoDto>) {
    await this.findOne(id);
    return this.prisma.riesgo.update({ where: { id }, data, include: { area: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.riesgo.delete({ where: { id } });
  }
}
