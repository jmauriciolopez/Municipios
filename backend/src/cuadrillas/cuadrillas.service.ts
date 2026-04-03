import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuadrillaDto } from './dto/create-cuadrilla.dto';
import { UpdateCuadrillaDto } from './dto/update-cuadrilla.dto';
import { CambiarEstadoCuadrillaDto } from './dto/cambiar-estado-cuadrilla.dto';
import { CuadrillaEstado } from '../common/enums/cuadrilla-estado.enum';

@Injectable()
export class CuadrillasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCuadrillaDto) {
    return this.prisma.cuadrilla.create({
      data: {
        nombre: data.nombre,
        municipioId: data.municipioId,
        areaId: data.areaId,
        estado: data.estado ?? CuadrillaEstado.DISPONIBLE,
        supervisorId: data.supervisorId,
      },
      include: {
        municipio: true,
        area: true,
        supervisor: true,
        miembros: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  async findAll(query?: any) {
    const where: any = { deletedAt: null };

    if (query?.estado) where.estado = query.estado;
    if (query?.area_id) where.areaId = query.area_id;
    if (query?.municipio_id) where.municipioId = query.municipio_id;
    if (query?.supervisor_id) where.supervisorId = query.supervisor_id;

    return this.prisma.cuadrilla.findMany({
      where,
      include: {
        municipio: true,
        area: true,
        supervisor: true,
        miembros: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const cuadrilla = await this.prisma.cuadrilla.findFirst({
      where: { id, deletedAt: null },
      include: {
        municipio: true,
        area: true,
        supervisor: true,
        miembros: {
          include: {
            usuario: true,
          },
        },
        ordenes: true,
      },
    });
    if (!cuadrilla) throw new NotFoundException('Cuadrilla no encontrada');
    return cuadrilla;
  }

  async update(id: string, data: UpdateCuadrillaDto) {
    await this.findOne(id);

    return this.prisma.cuadrilla.update({
      where: { id },
      data: {
        nombre: data.nombre,
        municipioId: data.municipioId,
        areaId: data.areaId,
        estado: data.estado,
        supervisorId: data.supervisorId,
      },
      include: {
        municipio: true,
        area: true,
        supervisor: true,
        miembros: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  async updateEstado(id: string, data: CambiarEstadoCuadrillaDto) {
    await this.findOne(id);

    return this.prisma.cuadrilla.update({
      where: { id },
      data: { estado: data.estado },
      include: {
        municipio: true,
        area: true,
        supervisor: true,
        miembros: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  async getOrdenes(id: string) {
    const cuadrilla = await this.findOne(id);
    return cuadrilla.ordenes;
  }

  async addMiembro(cuadrillaId: string, data: { usuarioId: string; rol?: string }) {
    await this.findOne(cuadrillaId);
    return this.prisma.cuadrillaMiembro.create({
      data: { cuadrillaId, usuarioId: data.usuarioId, rol: data.rol, activo: true },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    });
  }

  async removeMiembro(cuadrillaId: string, miembroId: string) {
    return this.prisma.cuadrillaMiembro.update({
      where: { id: miembroId },
      data: { activo: false, fechaSalida: new Date() },
    });
  }

  async getMiembros(cuadrillaId: string) {
    return this.prisma.cuadrillaMiembro.findMany({
      where: { cuadrillaId, activo: true },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    });
  }
