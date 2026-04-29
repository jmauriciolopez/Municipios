import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { CreateInventarioItemDto } from "./dto/create-inventario-item.dto";

@Injectable()
export class InventarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  findAll(query?: { area_id?: string }) {
    const where: any = { deletedAt: null };
    if (query?.area_id) where.areaId = query.area_id;
    return this.prisma.inventarioItem.findMany({
      where,
      include: { area: true },
      orderBy: { nombre: "asc" },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.inventarioItem.findFirst({
      where: { id, deletedAt: null },
      include: { area: true },
    });
    if (!item) throw new NotFoundException("Item no encontrado");
    return item;
  }

  async create(data: CreateInventarioItemDto, userId?: string) {
    const item = await this.prisma.inventarioItem.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        cantidad: data.cantidad,
        areaId: data.areaId,
      },
      include: { area: true },
    });
    if (userId) {
      await this.auditoria.logEvent(
        "inventario_item",
        item.id,
        "CREATE",
        userId,
        data,
      );
    }
    return item;
  }

  async update(
    id: string,
    data: Partial<CreateInventarioItemDto>,
    userId?: string,
  ) {
    await this.findOne(id);
    const item = await this.prisma.inventarioItem.update({
      where: { id },
      data,
      include: { area: true },
    });
    if (userId) {
      await this.auditoria.logEvent(
        "inventario_item",
        id,
        "UPDATE",
        userId,
        data,
      );
    }
    return item;
  }

  async ajustarCantidad(id: string, delta: number, userId?: string) {
    const item = await this.findOne(id);
    const nueva = Number(item.cantidad) + delta;
    if (nueva < 0) throw new Error("Stock insuficiente");
    const updated = await this.prisma.inventarioItem.update({
      where: { id },
      data: { cantidad: nueva },
      include: { area: true },
    });
    if (userId) {
      await this.auditoria.logEvent(
        "inventario_item",
        id,
        "STOCK_ADJUST",
        userId,
        { delta, nueva },
      );
    }
    return updated;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const item = await this.prisma.inventarioItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    if (userId) {
      await this.auditoria.logEvent("inventario_item", id, "DELETE", userId);
    }
    return item;
  }
}
