import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

const INCLUDE = {
  padre: { select: { id: true, codigo: true, nombre: true } },
  hijos: { select: { id: true, codigo: true, nombre: true, nivel: true, activo: true } },
};

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async findAll(soloActivos?: boolean) {
    return this.prisma.categoria.findMany({
      where: soloActivos ? { activo: true } : undefined,
      include: INCLUDE,
      orderBy: [{ nivel: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: string) {
    const cat = await this.prisma.categoria.findUnique({ where: { id }, include: INCLUDE });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async create(data: CreateCategoriaDto) {
    const exists = await this.prisma.categoria.findUnique({ where: { codigo: data.codigo } });
    if (exists) throw new ConflictException('El código ya existe');
    if (data.padreId) {
      const padre = await this.prisma.categoria.findUnique({ where: { id: data.padreId } });
      if (!padre) throw new NotFoundException('Categoría padre no encontrada');
    }
    return this.prisma.categoria.create({ data: { ...data, nivel: data.nivel ?? (data.padreId ? 2 : 1) }, include: INCLUDE });
  }

  async update(id: string, data: UpdateCategoriaDto) {
    await this.findOne(id);
    if (data.codigo) {
      const exists = await this.prisma.categoria.findFirst({ where: { codigo: data.codigo, NOT: { id } } });
      if (exists) throw new ConflictException('El código ya existe');
    }
    return this.prisma.categoria.update({ where: { id }, data, include: INCLUDE });
  }

  async remove(id: string) {
    await this.findOne(id);
    const hijos = await this.prisma.categoria.count({ where: { padreId: id } });
    if (hijos > 0) throw new ConflictException('No se puede eliminar una categoría con subcategorías');
    return this.prisma.categoria.delete({ where: { id } });
  }

  async toggleActivo(id: string) {
    const cat = await this.findOne(id);
    return this.prisma.categoria.update({ where: { id }, data: { activo: !cat.activo }, include: INCLUDE });
  }
}
