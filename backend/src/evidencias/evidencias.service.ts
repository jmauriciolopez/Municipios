import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEvidenciaDto } from "./dto/create-evidencia.dto";
import { AuditoriaService } from "../auditoria/auditoria.service";

@Injectable()
export class EvidenciasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  findByEntidad(entidadTipo: string, entidadId: string) {
    return this.prisma.evidencia.findMany({
      where: { entidadTipo, entidadId, deletedAt: null },
      include: {
        tomadoPorU: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { timestampFoto: "desc" },
    });
  }

  async create(data: CreateEvidenciaDto, userId?: string) {
    const evidencia = await this.prisma.evidencia.create({
      data: {
        entidadTipo: data.entidadTipo,
        entidadId: data.entidadId,
        url: data.url,
        tipo: data.tipo as any,
        caption: data.caption,
        tomadoPor: data.tomadoPor,
      },
      include: {
        tomadoPorU: { select: { id: true, nombre: true, email: true } },
      },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "evidencia",
        evidencia.id,
        "CREATE",
        userId,
        data,
      );
    }

    return evidencia;
  }

  async remove(id: string, userId?: string) {
    const e = await this.prisma.evidencia.findFirst({
      where: { id, deletedAt: null },
    });
    if (!e) throw new NotFoundException("Evidencia no encontrada");

    const evidencia = await this.prisma.evidencia.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (userId) {
      await this.auditoria.logEvent("evidencia", id, "DELETE", userId);
    }

    return evidencia;
  }
}
