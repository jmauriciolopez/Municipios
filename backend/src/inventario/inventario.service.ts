import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventarioItemDto } from './dto/create-inventario-item.dto';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: { area_id?: string }) {
    const where: any = { deletedAt: null };
    if (query?.area_id) where.areaId = query.area_id;
    return this.prisma.inventarioItem.findMany({ where, include: { area: true }, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.inventarioItem.findFirst({ where: { id, deletedAt: null }, include: { area: true } });
    if (!item) throw new NotFoundException('Item no encontrado');
    return item;
  }

  create(data: CreateInventarioItemDto) {
    return this.prisma.inventarioItem.create({ data: { codigo: data.codigo, nombre: data.nombre, descripcion: data.descripcion, cantidad: data.cantidad, areaId: data.areaId }, include: { area: true } });
  }

  async update(id: string, data: Partial<CreateInventarioItemDto>) {
    await this.findOne(id);
    return this.prisma.inventarioItem.update({ where: { id }, data, include: { area: true } });
  }

  async ajustarCantidad(id: string, delta: number) {
    const item = await this.findOne(id);
    const nueva = Number(item.cantidad) + delta;
    if (nueva < 0) throw new Error('Stock insuficiente');
    return this.prisma.inventarioItem.update({ where: { id }, data: { cantidad: nueva }, include: { area: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventarioItem.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
