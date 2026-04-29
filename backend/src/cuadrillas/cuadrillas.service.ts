import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCuadrillaDto } from "./dto/create-cuadrilla.dto";
import { UpdateCuadrillaDto } from "./dto/update-cuadrilla.dto";
import { CambiarEstadoCuadrillaDto } from "./dto/cambiar-estado-cuadrilla.dto";
import { CuadrillaEstado } from "../common/enums/cuadrilla-estado.enum";
import { AuditoriaService } from "../auditoria/auditoria.service";

const MIEMBROS_INCLUDE = {
  where: { activo: true },
  include: {
    persona: {
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    },
  },
};

const CUADRILLA_INCLUDE = {
  municipio: true,
  area: true,
  supervisor: true,
  miembros: MIEMBROS_INCLUDE,
};

@Injectable()
export class CuadrillasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async create(data: CreateCuadrillaDto, userId?: string) {
    const cuadrilla = await this.prisma.cuadrilla.create({
      data: {
        nombre: data.nombre,
        municipioId: data.municipioId,
        areaId: data.areaId,
        estado: data.estado ?? CuadrillaEstado.DISPONIBLE,
        supervisorId: data.supervisorId,
      },
      include: CUADRILLA_INCLUDE,
    });

    if (userId) {
      await this.auditoria.logEvent(
        "cuadrilla",
        cuadrilla.id,
        "CREATE",
        userId,
        data,
      );
    }

    return cuadrilla;
  }

  async findAll(query?: any) {
    const where: any = { deletedAt: null };
    if (query?.estado) where.estado = query.estado;
    if (query?.area_id) where.areaId = query.area_id;
    if (query?.municipio_id) where.municipioId = query.municipio_id;
    if (query?.supervisor_id) where.supervisorId = query.supervisor_id;
    return this.prisma.cuadrilla.findMany({
      where,
      include: CUADRILLA_INCLUDE,
    });
  }

  async findOne(id: string) {
    const cuadrilla = await this.prisma.cuadrilla.findFirst({
      where: { id, deletedAt: null },
      include: { ...CUADRILLA_INCLUDE, ordenes: true },
    });
    if (!cuadrilla) throw new NotFoundException("Cuadrilla no encontrada");
    return cuadrilla;
  }

  async update(id: string, data: UpdateCuadrillaDto, userId?: string) {
    await this.findOne(id);
    const cuadrilla = await this.prisma.cuadrilla.update({
      where: { id },
      data: {
        nombre: data.nombre,
        municipioId: data.municipioId,
        areaId: data.areaId,
        estado: data.estado,
        supervisorId: data.supervisorId,
      },
      include: CUADRILLA_INCLUDE,
    });

    if (userId) {
      await this.auditoria.logEvent("cuadrilla", id, "UPDATE", userId, data);
    }

    return cuadrilla;
  }

  async updateEstado(
    id: string,
    data: CambiarEstadoCuadrillaDto,
    userId?: string,
  ) {
    await this.findOne(id);
    const cuadrilla = await this.prisma.cuadrilla.update({
      where: { id },
      data: { estado: data.estado },
      include: CUADRILLA_INCLUDE,
    });

    if (userId) {
      await this.auditoria.logEvent(
        "cuadrilla",
        id,
        "STATUS_CHANGE",
        userId,
        data,
      );
    }

    return cuadrilla;
  }

  async getOrdenes(id: string) {
    const cuadrilla = await this.findOne(id);
    return cuadrilla.ordenes;
  }

  async getMiembros(cuadrillaId: string) {
    return this.prisma.cuadrillaMiembro.findMany({
      where: { cuadrillaId, activo: true },
      include: {
        persona: {
          include: {
            usuario: { select: { id: true, nombre: true, email: true } },
          },
        },
      },
    });
  }

  async addMiembro(
    cuadrillaId: string,
    data: { personaId: string; rol?: string },
    userId?: string,
  ) {
    await this.findOne(cuadrillaId);
    const existing = await this.prisma.cuadrillaMiembro.findFirst({
      where: { cuadrillaId, personaId: data.personaId, activo: true },
    });
    if (existing) return existing;
    const miembro = await this.prisma.cuadrillaMiembro.create({
      data: {
        cuadrillaId,
        personaId: data.personaId,
        rol: data.rol,
        activo: true,
      },
      include: {
        persona: {
          include: {
            usuario: { select: { id: true, nombre: true, email: true } },
          },
        },
      },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "cuadrilla",
        cuadrillaId,
        "ADD_MEMBER",
        userId,
        { personaId: data.personaId, rol: data.rol },
      );
    }

    return miembro;
  }

  async removeMiembro(cuadrillaId: string, miembroId: string, userId?: string) {
    const miembro = await this.prisma.cuadrillaMiembro.update({
      where: { id: miembroId },
      data: { activo: false, fechaSalida: new Date() },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "cuadrilla",
        cuadrillaId,
        "REMOVE_MEMBER",
        userId,
        { miembroId },
      );
    }

    return miembro;
  }
}
