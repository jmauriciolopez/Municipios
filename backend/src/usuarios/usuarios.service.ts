import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcryptjs';

const SELECT_USUARIO = {
  id: true, nombre: true, email: true, telefono: true,
  estado: true, municipioId: true, createdAt: true,
  municipio: { select: { id: true, nombre: true } },
  roles: { include: { rol: true } },
};

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { estado?: string; municipio_id?: string }) {
    const where: any = { deletedAt: null };
    if (query?.estado !== undefined) where.estado = query.estado === 'true';
    if (query?.municipio_id) where.municipioId = query.municipio_id;
    return this.prisma.usuario.findMany({ where, select: SELECT_USUARIO, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const u = await this.prisma.usuario.findFirst({ where: { id, deletedAt: null }, select: SELECT_USUARIO });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async create(data: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findFirst({ where: { email: data.email, deletedAt: null } });
    if (exists) throw new ConflictException('El email ya está registrado');
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre, email: data.email,
        telefono: data.telefono, municipioId: data.municipioId,
        estado: data.estado ?? true,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: SELECT_USUARIO,
    });
  }

  async update(id: string, data: UpdateUsuarioDto) {
    await this.findOne(id);
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    return this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: data.nombre, email: data.email,
        telefono: data.telefono, municipioId: data.municipioId,
        estado: data.estado,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: SELECT_USUARIO,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.usuario.update({ where: { id }, data: { deletedAt: new Date(), estado: false } });
  }

  async getRoles() {
    return this.prisma.rol.findMany({ orderBy: { nombre: 'asc' } });
  }

  async asignarRol(usuarioId: string, rolId: string) {
    await this.findOne(usuarioId);
    const rol = await this.prisma.rol.findUnique({ where: { id: rolId } });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return this.prisma.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId, rolId } },
      update: {},
      create: { usuarioId, rolId },
    });
  }

  async quitarRol(usuarioId: string, rolId: string) {
    await this.findOne(usuarioId);
    return this.prisma.usuarioRol.delete({ where: { usuarioId_rolId: { usuarioId, rolId } } });
  }
}
