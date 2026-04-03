import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto } from './dto/create-persona.dto';

const INCLUDE = {
  usuario: { select: { id: true, email: true, nombre: true } },
  cuadrillas: {
    where: { activo: true },
    include: { cuadrilla: { select: { id: true, nombre: true } } },
  },
};

@Injectable()
export class PersonasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: { busqueda?: string; activo?: string }) {
    const where: any = {};
    if (query?.activo !== undefined) where.activo = query.activo === 'true';
    if (query?.busqueda) {
      where.OR = [
        { nombre: { contains: query.busqueda, mode: 'insensitive' } },
        { dni: { contains: query.busqueda, mode: 'insensitive' } },
        { email: { contains: query.busqueda, mode: 'insensitive' } },
      ];
    }
    return this.prisma.persona.findMany({ where, include: INCLUDE, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const p = await this.prisma.persona.findUnique({ where: { id }, include: INCLUDE });
    if (!p) throw new NotFoundException('Persona no encontrada');
    return p;
  }

  async create(data: CreatePersonaDto) {
    if (data.dni) {
      const exists = await this.prisma.persona.findUnique({ where: { dni: data.dni } });
      if (exists) throw new ConflictException('Ya existe una persona con ese DNI');
    }
    return this.prisma.persona.create({ data, include: INCLUDE });
  }

  async createFromUsuario(usuarioId: string, nombre: string, email?: string) {
    const existing = await this.prisma.persona.findUnique({ where: { usuarioId } });
    if (existing) return existing;
    return this.prisma.persona.create({
      data: { nombre, email, usuarioId, activo: true },
      include: INCLUDE,
    });
  }

  async update(id: string, data: Partial<CreatePersonaDto>) {
    await this.findOne(id);
    return this.prisma.persona.update({ where: { id }, data, include: INCLUDE });
  }

  async toggleActivo(id: string) {
    const p = await this.findOne(id);
    return this.prisma.persona.update({ where: { id }, data: { activo: !p.activo }, include: INCLUDE });
  }
}
