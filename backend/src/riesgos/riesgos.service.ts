import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRiesgoDto } from "./dto/create-riesgo.dto";
import { AuditoriaService } from "../auditoria/auditoria.service";

const INCLUDE = {
  area: true,
  categoria: true,
  tipoActivo: true,
  _count: { select: { incidentes: true } },
};

@Injectable()
export class RiesgosService {
  constructor(
    private readonly prisma: PrismaService,
    private auditoria: AuditoriaService,
  ) {}

  findAll(query?: {
    area_id?: string;
    categoria_id?: string;
    tipo_activo_id?: string;
    activo?: string;
  }) {
    const where: any = {};
    if (query?.area_id) where.areaId = query.area_id;
    if (query?.categoria_id) where.categoriaId = query.categoria_id;
    if (query?.tipo_activo_id) where.tipoActivoId = query.tipo_activo_id;
    if (query?.activo !== undefined) where.activo = query.activo === "true";
    return this.prisma.riesgo.findMany({
      where,
      include: INCLUDE,
      orderBy: [{ severidadBase: "desc" }, { nombre: "asc" }],
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.riesgo.findUnique({
      where: { id },
      include: {
        ...INCLUDE,
        incidentes: { take: 5, orderBy: { fechaReporte: "desc" } },
      },
    });
    if (!r) throw new NotFoundException("Riesgo no encontrado");
    return r;
  }

  async create(data: CreateRiesgoDto, userId: string) {
    const riesgo = await this.prisma.riesgo.create({ data, include: INCLUDE });
    await this.auditoria.logEvent("RIESGO", riesgo.id, "CREATE", userId, data);
    return riesgo;
  }

  async update(id: string, data: Partial<CreateRiesgoDto>, userId: string) {
    await this.findOne(id);
    const riesgo = await this.prisma.riesgo.update({
      where: { id },
      data,
      include: INCLUDE,
    });
    await this.auditoria.logEvent("RIESGO", id, "UPDATE", userId, data);
    return riesgo;
  }

  async remove(id: string, userId: string) {
    const riesgo = await this.findOne(id);
    await this.prisma.riesgo.delete({ where: { id } });
    await this.auditoria.logEvent("RIESGO", id, "DELETE", userId, {
      nombre: riesgo.nombre,
    });
    return { deleted: true };
  }

  async toggleActivo(id: string, userId: string) {
    const r = await this.findOne(id);
    const updated = await this.prisma.riesgo.update({
      where: { id },
      data: { activo: !r.activo },
      include: INCLUDE,
    });
    await this.auditoria.logEvent("RIESGO", id, "STATUS_CHANGE", userId, {
      activo: updated.activo,
    });
    return updated;
  }
}
