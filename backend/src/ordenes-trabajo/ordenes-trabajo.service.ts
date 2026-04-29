import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { CreateOrdenTrabajoDto } from "./dto/create-orden-trabajo.dto";
import { UpdateOrdenTrabajoDto } from "./dto/update-orden-trabajo.dto";
import { AsignarCuadrillaDto } from "./dto/asignar-cuadrilla.dto";
import { CambiarEstadoOrdenDto } from "./dto/cambiar-estado-orden.dto";
import { OrdenEstado } from "../common/enums/orden-estado.enum";

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  private normalizeFecha(value?: string | null) {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date;
  }

  async create(data: CreateOrdenTrabajoDto, userId?: string) {
    const payload: any = {
      codigo: data.codigo,
      incidenteId: data.incidente_id,
      areaId: data.area_id,
      cuadrillaId: data.cuadrilla_id,
      estado: data.estado ?? OrdenEstado.DETECTADO,
      prioridad: data.prioridad,
      descripcion: data.descripcion,
      fechaAsignacion: this.normalizeFecha(data.fecha_asignacion),
      fechaInicio: this.normalizeFecha(data.fecha_inicio),
      fechaCierre: this.normalizeFecha(data.fecha_cierre),
    };

    const orden = await this.prisma.ordenTrabajo.create({
      data: payload,
    });

    if (userId) {
      await this.auditoria.logEvent(
        "orden_trabajo",
        orden.id,
        "CREATE",
        userId,
        data,
      );
    }

    return orden;
  }

  async findAll(query?: any) {
    const where: any = { deletedAt: null };

    if (query?.estado) where.estado = query.estado;
    if (query?.prioridad) where.prioridad = query.prioridad;
    if (query?.area_id) where.areaId = query.area_id;
    if (query?.cuadrilla_id) where.cuadrillaId = query.cuadrilla_id;
    if (query?.fecha_desde || query?.fecha_hasta) {
      where.fechaAsignacion = {};
      if (query.fecha_desde)
        where.fechaAsignacion.gte = new Date(query.fecha_desde);
      if (query.fecha_hasta)
        where.fechaAsignacion.lte = new Date(query.fecha_hasta);
    }

    return this.prisma.ordenTrabajo.findMany({
      where,
      include: {
        area: true,
        cuadrilla: true,
        incidente: true,
      },
    });
  }

  async findOne(id: string) {
    const orden = await this.prisma.ordenTrabajo.findFirst({
      where: { id, deletedAt: null },
      include: {
        area: true,
        cuadrilla: true,
        incidente: true,
      },
    });
    if (!orden) throw new NotFoundException("Orden no encontrada");
    return orden;
  }

  async update(id: string, data: UpdateOrdenTrabajoDto, userId?: string) {
    await this.findOne(id);

    const payload: any = {
      incidenteId: data.incidente_id,
      areaId: data.area_id,
      cuadrillaId: data.cuadrilla_id,
      estado: data.estado,
      prioridad: data.prioridad,
      descripcion: data.descripcion,
      fechaAsignacion: this.normalizeFecha(data.fecha_asignacion),
      fechaInicio: this.normalizeFecha(data.fecha_inicio),
      fechaCierre: this.normalizeFecha(data.fecha_cierre),
    };

    const orden = await this.prisma.ordenTrabajo.update({
      where: { id },
      data: payload,
    });

    if (userId) {
      await this.auditoria.logEvent(
        "orden_trabajo",
        id,
        "UPDATE",
        userId,
        data,
      );
    }

    return orden;
  }

  async asignarCuadrilla(
    id: string,
    data: AsignarCuadrillaDto,
    userId?: string,
  ) {
    await this.findOne(id);
    const orden = await this.prisma.ordenTrabajo.update({
      where: { id },
      data: {
        cuadrillaId: data.cuadrilla_id,
        fechaAsignacion: new Date(),
        estado: OrdenEstado.ASIGNADO,
      },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "orden_trabajo",
        id,
        "ASSIGN_CREW",
        userId,
        data,
      );
    }

    return orden;
  }

  async cambiarEstado(
    id: string,
    data: CambiarEstadoOrdenDto,
    userId?: string,
  ) {
    const orden = await this.findOne(id);

    if (
      data.estado === OrdenEstado.RESUELTO &&
      orden.estado !== OrdenEstado.EN_PROCESO
    ) {
      throw new BadRequestException(
        "No se puede pasar a resuelto si no está en proceso",
      );
    }
    if (
      data.estado === OrdenEstado.VERIFICADO &&
      orden.estado !== OrdenEstado.RESUELTO
    ) {
      throw new BadRequestException(
        "No se puede verificar si no está resuelto",
      );
    }

    const updatePayload: any = {
      estado: data.estado,
    };

    if (data.estado === OrdenEstado.EN_PROCESO) {
      updatePayload.fechaInicio = orden.fechaInicio ?? new Date();
    }

    if (data.estado === OrdenEstado.RESUELTO) {
      updatePayload.fechaCierre = new Date();
    }

    const ordenUpdated = await this.prisma.ordenTrabajo.update({
      where: { id },
      data: updatePayload,
    });

    if (userId) {
      await this.auditoria.logEvent(
        "orden_trabajo",
        id,
        "CHANGE_STATUS",
        userId,
        data,
      );
    }

    return ordenUpdated;
  }

  async getEvidencias(id: string) {
    await this.findOne(id);
    return this.prisma.evidencia.findMany({
      where: {
        entidadTipo: "orden",
        entidadId: id,
        deletedAt: null,
      },
    });
  }

  calcularDuracion(orden: any) {
    const inicio = orden.fechaInicio
      ? new Date(orden.fechaInicio).getTime()
      : null;
    const cierre = orden.fechaCierre
      ? new Date(orden.fechaCierre).getTime()
      : null;
    const horas =
      inicio && cierre ? (cierre - inicio) / (1000 * 60 * 60) : null;
    return { estimada_horas: horas, real_horas: horas };
  }

  async getMateriales(id: string) {
    await this.findOne(id);
    return this.prisma.ordenMaterial.findMany({
      where: { ordenId: id },
      orderBy: { createdAt: "asc" },
    });
  }

  async addMaterial(
    id: string,
    data: { item: string; cantidad: number; unidad: string; estado?: string },
    userId?: string,
  ) {
    await this.findOne(id);
    const material = await this.prisma.ordenMaterial.create({
      data: {
        ordenId: id,
        item: data.item,
        cantidad: data.cantidad,
        unidad: data.unidad,
        estado: data.estado,
      },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "orden_trabajo",
        id,
        "ADD_MATERIAL",
        userId,
        data,
      );
    }

    return material;
  }

  async updateMaterial(
    ordenId: string,
    materialId: string,
    data: Partial<{
      item: string;
      cantidad: number;
      unidad: string;
      estado: string;
    }>,
    userId?: string,
  ) {
    const material = await this.prisma.ordenMaterial.update({
      where: { id: materialId },
      data,
    });

    if (userId) {
      await this.auditoria.logEvent(
        "orden_trabajo",
        ordenId,
        "UPDATE_MATERIAL",
        userId,
        { materialId, ...data },
      );
    }

    return material;
  }

  async removeMaterial(ordenId: string, materialId: string, userId?: string) {
    const material = await this.prisma.ordenMaterial.delete({
      where: { id: materialId },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "orden_trabajo",
        ordenId,
        "REMOVE_MATERIAL",
        userId,
        { materialId },
      );
    }

    return material;
  }
}
