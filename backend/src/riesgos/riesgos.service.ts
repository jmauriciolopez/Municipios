import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRiesgoDto } from './dto/create-riesgo.dto';

const INCLUDE = {
  area: true,
  categoria: true,
  tipoActivo: true,
  _count: { select: { incidentes: true } },
};

// nivel calculado en app: severidad * probabilidad
export const calcNivel = (s: number, p: number) => s * p;

@Injectable()
export class RiesgosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: { area_id?: string; categoria_id?: string; tipo_activo_id?: string; activo?: string }) {
    const where: any = {};
    if (query?.area_id) where.areaId = query.area_id;
    if (query?.categoria_id) where.categoriaId = query.categoria_id;
    if (query?.tipo_activo_id) where.tipoActivoId = query.tipo_activo_id;
    if (query?.activo !== undefined) where.activo = query.activo === 'true';
    return this.prisma.riesgo.findMany({
      where,
      include: INCLUDE,
      orderBy: [{ severidadBase: 'desc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.riesgo.findUnique({
      where: { id },
      include: { ...INCLUDE, incidentes: { take: 5, orderBy: { fechaReporte: 'desc' } } },
    });
    if (!r) throw new NotFoundException('Riesgo no encontrado');
    return r;
  }

  create(data: CreateRiesgoDto) {
    return this.prisma.riesgo.create({ data, include: INCLUDE });
  }

  async update(id: string, data: Partial<CreateRiesgoDto>) {
    await this.findOne(id);
    return this.prisma.riesgo.update({ where: { id }, data, include: INCLUDE });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.riesgo.delete({ where: { id } });
  }

  async toggleActivo(id: string) {
    const r = await this.findOne(id);
    return this.prisma.riesgo.update({ where: { id }, data: { activo: !r.activo }, include: INCLUDE });
  }
}
