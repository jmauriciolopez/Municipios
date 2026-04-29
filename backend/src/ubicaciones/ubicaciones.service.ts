import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUbicacionDto } from "./dto/create-ubicacion.dto";
import { AuditoriaService } from "../auditoria/auditoria.service";

@Injectable()
export class UbicacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  findByEntidad(entidadTipo: string, entidadId: string) {
    return this.prisma.ubicacion.findMany({
      where: { entidadTipo, entidadId },
      orderBy: { createdAt: "desc" },
    });
  }

  findAll(query?: { entidad_tipo?: string; entidad_id?: string }) {
    const where: any = {};
    if (query?.entidad_tipo) where.entidadTipo = query.entidad_tipo;
    if (query?.entidad_id) where.entidadId = query.entidad_id;
    return this.prisma.ubicacion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

  async create(data: CreateUbicacionDto, userId?: string) {
    const ubicacion = await this.prisma.ubicacion.create({
      data: {
        entidadTipo: data.entidadTipo,
        entidadId: data.entidadId,
        lat: data.lat,
        lng: data.lng,
        direccion: data.direccion,
      },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "ubicacion",
        ubicacion.id,
        "CREATE",
        userId,
        data,
      );
    }

    return ubicacion;
  }
}
