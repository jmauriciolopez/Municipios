import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { AuditoriaService } from "../auditoria/auditoria.service";

const INCLUDE = {
  usuario: { select: { id: true, email: true, nombre: true } },
  cuadrillas: {
    where: { activo: true },
    include: { cuadrilla: { select: { id: true, nombre: true } } },
  },
};

@Injectable()
export class PersonasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  findAll(query?: { busqueda?: string; activo?: string }) {
    const where: any = {};
    if (query?.activo !== undefined) where.activo = query.activo === "true";
    if (query?.busqueda) {
      where.OR = [
        { nombre: { contains: query.busqueda, mode: "insensitive" } },
        { dni: { contains: query.busqueda, mode: "insensitive" } },
        { email: { contains: query.busqueda, mode: "insensitive" } },
      ];
    }
    return this.prisma.persona.findMany({
      where,
      include: INCLUDE,
      orderBy: { nombre: "asc" },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.persona.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!p) throw new NotFoundException("Persona no encontrada");
    return p;
  }

  async create(data: CreatePersonaDto, userId?: string) {
    if (data.dni) {
      const exists = await this.prisma.persona.findUnique({
        where: { dni: data.dni },
      });
      if (exists)
        throw new ConflictException("Ya existe una persona con ese DNI");
    }
    const persona = await this.prisma.persona.create({
      data,
      include: INCLUDE,
    });

    if (userId) {
      await this.auditoria.logEvent(
        "persona",
        persona.id,
        "CREATE",
        userId,
        data,
      );
    }

    return persona;
  }

  async createFromUsuario(usuarioId: string, nombre: string, email?: string) {
    const existing = await this.prisma.persona.findUnique({
      where: { usuarioId },
    });
    if (existing) return existing;
    return this.prisma.persona.create({
      data: { nombre, email, usuarioId, activo: true },
      include: INCLUDE,
    });
  }

  async update(id: string, data: Partial<CreatePersonaDto>, userId?: string) {
    await this.findOne(id);
    const persona = await this.prisma.persona.update({
      where: { id },
      data,
      include: INCLUDE,
    });

    if (userId) {
      await this.auditoria.logEvent("persona", id, "UPDATE", userId, data);
    }

    return persona;
  }

  async toggleActivo(id: string, userId?: string) {
    const p = await this.findOne(id);
    const persona = await this.prisma.persona.update({
      where: { id },
      data: { activo: !p.activo },
      include: INCLUDE,
    });

    if (userId) {
      await this.auditoria.logEvent("persona", id, "TOGGLE_ACTIVE", userId, {
        activo: persona.activo,
      });
    }

    return persona;
  }
}
