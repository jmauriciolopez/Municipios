import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAreaDto } from "./dto/create-area.dto";
import { UpdateAreaDto } from "./dto/update-area.dto";
import { AuditoriaService } from "../auditoria/auditoria.service";

@Injectable()
export class AreasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async create(data: CreateAreaDto, userId?: string) {
    const area = await this.prisma.area.create({
      data: {
        municipioId: data.municipioId,
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
      include: {
        municipio: true,
      },
    });

    if (userId) {
      await this.auditoria.logEvent("area", area.id, "CREATE", userId, data);
    }

    return area;
  }

  async findAll() {
    return this.prisma.area.findMany({
      where: { deletedAt: null },
      include: {
        municipio: true,
        cuadrillas: true,
        activos: true,
        riesgos: true,
        incidentes: true,
        ordenes: true,
      },
    });
  }

  async findOne(id: string) {
    const area = await this.prisma.area.findFirst({
      where: { id, deletedAt: null },
      include: {
        municipio: true,
        cuadrillas: true,
        activos: true,
        riesgos: true,
        incidentes: true,
        ordenes: true,
        inspecciones: true,
        inventario: true,
      },
    });
    if (!area) throw new NotFoundException("Área no encontrada");
    return area;
  }

  async update(id: string, data: UpdateAreaDto, userId?: string) {
    await this.findOne(id);

    const area = await this.prisma.area.update({
      where: { id },
      data: {
        municipioId: data.municipioId,
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
      include: {
        municipio: true,
      },
    });

    if (userId) {
      await this.auditoria.logEvent("area", id, "UPDATE", userId, data);
    }

    return area;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);

    const area = await this.prisma.area.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (userId) {
      await this.auditoria.logEvent("area", id, "DELETE", userId);
    }

    return area;
  }
}
