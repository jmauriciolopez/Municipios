import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoActivoDto } from './dto/create-tipo-activo.dto';

@Injectable()
export class TiposActivoService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tipoActivo.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { activos: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const t = await this.prisma.tipoActivo.findFirst({ where: { id, deletedAt: null } });
    if (!t) throw new NotFoundException('Tipo de activo no encontrado');
    return t;
  }

  async create(data: CreateTipoActivoDto) {
    const exists = await this.prisma.tipoActivo.findFirst({ where: { nombre: data.nombre, deletedAt: null } });
    if (exists) throw new ConflictException('Ya existe un tipo con ese nombre');
    return this.prisma.tipoActivo.create({ data });
  }

  async update(id: string, data: Partial<CreateTipoActivoDto>) {
    await this.findOne(id);
    return this.prisma.tipoActivo.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tipoActivo.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
