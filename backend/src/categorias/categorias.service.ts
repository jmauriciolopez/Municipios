import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoriaDto } from "./dto/create-categoria.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";
import { AuditoriaService } from "../auditoria/auditoria.service";

const INCLUDE = {
  padre: { select: { id: true, codigo: true, nombre: true } },
  hijos: {
    select: { id: true, codigo: true, nombre: true, nivel: true, activo: true },
  },
};

@Injectable()
export class CategoriasService {
  constructor(
    private prisma: PrismaService,
    private auditoria: AuditoriaService,
  ) {}

  async findAll(soloActivos?: boolean) {
    return this.prisma.categoria.findMany({
      where: soloActivos ? { activo: true } : undefined,
      include: INCLUDE,
      orderBy: [{ nivel: "asc" }, { nombre: "asc" }],
    });
  }

  async findOne(id: string) {
    const cat = await this.prisma.categoria.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!cat) throw new NotFoundException("Categoría no encontrada");
    return cat;
  }

  async create(data: CreateCategoriaDto, userId: string) {
    const exists = await this.prisma.categoria.findUnique({
      where: { codigo: data.codigo },
    });
    if (exists) throw new ConflictException("El código ya existe");
    if (data.padreId) {
      const padre = await this.prisma.categoria.findUnique({
        where: { id: data.padreId },
      });
      if (!padre) throw new NotFoundException("Categoría padre no encontrada");
    }
    const cat = await this.prisma.categoria.create({
      data: { ...data, nivel: data.nivel ?? (data.padreId ? 2 : 1) },
      include: INCLUDE,
    });
    await this.auditoria.logEvent("CATEGORIA", cat.id, "CREATE", userId, data);
    return cat;
  }

  async update(id: string, data: UpdateCategoriaDto, userId: string) {
    await this.findOne(id);
    if (data.codigo) {
      const exists = await this.prisma.categoria.findFirst({
        where: { codigo: data.codigo, NOT: { id } },
      });
      if (exists) throw new ConflictException("El código ya existe");
    }
    const cat = await this.prisma.categoria.update({
      where: { id },
      data,
      include: INCLUDE,
    });
    await this.auditoria.logEvent("CATEGORIA", id, "UPDATE", userId, data);
    return cat;
  }

  async remove(id: string, userId: string) {
    const cat = await this.findOne(id);
    const hijos = await this.prisma.categoria.count({ where: { padreId: id } });
    if (hijos > 0)
      throw new ConflictException(
        "No se puede eliminar una categoría con subcategorías",
      );
    await this.prisma.categoria.delete({ where: { id } });
    await this.auditoria.logEvent("CATEGORIA", id, "DELETE", userId, {
      codigo: cat.codigo,
      nombre: cat.nombre,
    });
    return { deleted: true };
  }

  async toggleActivo(id: string, userId: string) {
    const cat = await this.findOne(id);
    const updated = await this.prisma.categoria.update({
      where: { id },
      data: { activo: !cat.activo },
      include: INCLUDE,
    });
    await this.auditoria.logEvent("CATEGORIA", id, "STATUS_CHANGE", userId, {
      activo: updated.activo,
    });
    return updated;
  }
}
