import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { CreateMunicipioDto } from "./dto/create-municipio.dto";

@Injectable()
export class MunicipiosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  findAll() {
    return this.prisma.municipio.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { areas: true, usuarios: true, activos: true } },
      },
      orderBy: { nombre: "asc" },
    });
  }

  async findOne(id: string) {
    const m = await this.prisma.municipio.findFirst({
      where: { id, deletedAt: null },
      include: {
        areas: true,
        _count: { select: { usuarios: true, activos: true, incidentes: true } },
      },
    });
    if (!m) throw new NotFoundException("Municipio no encontrado");
    return m;
  }

  async create(data: CreateMunicipioDto, userId?: string) {
    const m = await this.prisma.municipio.create({ data });
    if (userId) {
      await this.auditoria.logEvent("municipio", m.id, "CREATE", userId, data);
    }
    return m;
  }

  async update(id: string, data: Partial<CreateMunicipioDto>, userId?: string) {
    await this.findOne(id);
    const m = await this.prisma.municipio.update({ where: { id }, data });
    if (userId) {
      await this.auditoria.logEvent("municipio", id, "UPDATE", userId, data);
    }
    return m;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const m = await this.prisma.municipio.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    if (userId) {
      await this.auditoria.logEvent("municipio", id, "DELETE", userId);
    }
    return m;
  }
}
