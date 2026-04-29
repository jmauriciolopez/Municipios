import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { CreateActivoDto } from "./dto/create-activo.dto";
import { UpdateActivoDto } from "./dto/update-activo.dto";
import { ActivoEstado } from "../common/enums/activo-estado.enum";

@Injectable()
export class ActivosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async create(data: CreateActivoDto, userId?: string) {
    const activo = await this.prisma.activo.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        tipoActivoId: data.tipoActivoId,
        municipioId: data.municipioId,
        estado: data.estado ?? ActivoEstado.OPERATIVO,
        lat: data.lat ? data.lat : null,
        lng: data.lng ? data.lng : null,
        direccion: data.direccion,
        areaResponsableId: data.areaResponsableId,
      },
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
      },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "activo",
        activo.id,
        "CREATE",
        userId,
        data,
      );
    }

    return activo;
  }

  async findAll(query?: any) {
    const where: any = { deletedAt: null };

    if (query?.estado) where.estado = query.estado;
    if (query?.tipo_activo_id) where.tipoActivoId = query.tipo_activo_id;
    if (query?.area_responsable_id)
      where.areaResponsableId = query.area_responsable_id;
    if (query?.municipio_id) where.municipioId = query.municipio_id;

    return this.prisma.activo.findMany({
      where,
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
      },
    });
  }

  async findOne(id: string) {
    const activo = await this.prisma.activo.findFirst({
      where: { id, deletedAt: null },
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
        incidentes: {
          where: { deletedAt: null },
          orderBy: { fechaReporte: "desc" },
          take: 10,
          include: { area: true },
        },
        inspecciones: {
          orderBy: { fechaInspeccion: "desc" },
          take: 5,
        },
      },
    });
    if (!activo) throw new NotFoundException("Activo no encontrado");

    // Riesgos asociados al tipo de activo
    const riesgos = await this.prisma.riesgo.findMany({
      where: { tipoActivoId: activo.tipoActivoId, activo: true },
      include: { categoria: true },
      orderBy: [{ severidadBase: "desc" }, { probabilidadBase: "desc" }],
    });

    return { ...activo, riesgos };
  }

  async update(id: string, data: UpdateActivoDto, userId?: string) {
    await this.findOne(id);
    const payload: any = {};
    if (data.codigo !== undefined) payload.codigo = data.codigo;
    if (data.nombre !== undefined) payload.nombre = data.nombre;
    if (data.tipoActivoId !== undefined)
      payload.tipoActivoId = data.tipoActivoId;
    if (data.municipioId !== undefined) payload.municipioId = data.municipioId;
    if (data.estado !== undefined) payload.estado = data.estado;
    if (data.lat !== undefined) payload.lat = data.lat ?? null;
    if (data.lng !== undefined) payload.lng = data.lng ?? null;
    if (data.direccion !== undefined) payload.direccion = data.direccion;
    if (data.areaResponsableId !== undefined)
      payload.areaResponsableId = data.areaResponsableId;
    const activo = await this.prisma.activo.update({
      where: { id },
      data: payload,
      include: { municipio: true, tipoActivo: true, areaResponsable: true },
    });

    if (userId) {
      await this.auditoria.logEvent("activo", id, "UPDATE", userId, data);
    }

    return activo;
  }

  async findNearby(query: { lat?: number; lng?: number; radio?: number }) {
    if (!query.lat || !query.lng || !query.radio) {
      return this.findAll();
    }

    // Implementación de Bounding Box para búsqueda espacial simple sin PostGIS
    const radioKm = query.radio / 1000;
    const latDelta = radioKm / 111.1; // 1 grado de latitud ~ 111.1 km
    const lngDelta = radioKm / (111.1 * Math.cos((query.lat * Math.PI) / 180));

    return this.prisma.activo.findMany({
      where: {
        deletedAt: null,
        lat: {
          gte: query.lat - latDelta,
          lte: query.lat + latDelta,
        },
        lng: {
          gte: query.lng - lngDelta,
          lte: query.lng + lngDelta,
        },
      },
      include: {
        municipio: true,
        tipoActivo: true,
        areaResponsable: true,
      },
    });
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const activo = await this.prisma.activo.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (userId) {
      await this.auditoria.logEvent("activo", id, "DELETE", userId);
    }

    return activo;
  }
}
