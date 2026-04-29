import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTipoActivoDto } from "./dto/create-tipo-activo.dto";
import { AuditoriaService } from "../auditoria/auditoria.service";

@Injectable()
export class TiposActivoService {
  constructor(
    private readonly prisma: PrismaService,
    private auditoria: AuditoriaService,
  ) {}

  findAll() {
    return this.prisma.tipoActivo.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { activos: true, riesgos: true } } },
      orderBy: { nombre: "asc" },
    });
  }

  async findOne(id: string) {
    const t = await this.prisma.tipoActivo.findFirst({
      where: { id, deletedAt: null },
    });
    if (!t) throw new NotFoundException("Tipo de activo no encontrado");
    return t;
  }

  async create(data: CreateTipoActivoDto, userId: string) {
    const exists = await this.prisma.tipoActivo.findFirst({
      where: { nombre: data.nombre, deletedAt: null },
    });
    if (exists) throw new ConflictException("Ya existe un tipo con ese nombre");
    const tipo = await this.prisma.tipoActivo.create({ data });
    await this.auditoria.logEvent(
      "TIPO_ACTIVO",
      tipo.id,
      "CREATE",
      userId,
      data,
    );
    return tipo;
  }

  async update(id: string, data: Partial<CreateTipoActivoDto>, userId: string) {
    await this.findOne(id);
    const tipo = await this.prisma.tipoActivo.update({ where: { id }, data });
    await this.auditoria.logEvent("TIPO_ACTIVO", id, "UPDATE", userId, data);
    return tipo;
  }

  async remove(id: string, userId: string) {
    const tipo = await this.findOne(id);
    await this.prisma.tipoActivo.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.auditoria.logEvent("TIPO_ACTIVO", id, "DELETE", userId, {
      nombre: tipo.nombre,
    });
    return { deleted: true };
  }
}
