import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import * as bcrypt from "bcryptjs";
import { PersonasService } from "../personas/personas.service";
import { AuditoriaService } from "../auditoria/auditoria.service";

const SELECT_USUARIO = {
  id: true,
  nombre: true,
  email: true,
  telefono: true,
  estado: true,
  municipioId: true,
  createdAt: true,
  municipio: { select: { id: true, nombre: true } },
  roles: { include: { rol: true } },
};

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personasService: PersonasService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async findAll(query?: { estado?: string; municipio_id?: string }) {
    const where: any = { deletedAt: null };
    if (query?.estado !== undefined) where.estado = query.estado === "true";
    if (query?.municipio_id) where.municipioId = query.municipio_id;
    return this.prisma.usuario.findMany({
      where,
      select: SELECT_USUARIO,
      orderBy: { nombre: "asc" },
    });
  }

  async findOne(id: string) {
    const u = await this.prisma.usuario.findFirst({
      where: { id, deletedAt: null },
      select: SELECT_USUARIO,
    });
    if (!u) throw new NotFoundException("Usuario no encontrado");
    return u;
  }

  async create(data: CreateUsuarioDto, userId?: string) {
    const exists = await this.prisma.usuario.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (exists) throw new ConflictException("El email ya está registrado");
    const passwordHash = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;
    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        municipioId: data.municipioId,
        estado: data.estado ?? true,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: SELECT_USUARIO,
    });
    // Crear persona automáticamente vinculada al usuario
    await this.personasService.createFromUsuario(
      usuario.id,
      usuario.nombre,
      usuario.email,
    );

    if (userId) {
      await this.auditoria.logEvent("usuario", usuario.id, "CREATE", userId, {
        nombre: data.nombre,
        email: data.email,
      });
    }

    return usuario;
  }

  async update(id: string, data: UpdateUsuarioDto, userId?: string) {
    await this.findOne(id);
    const passwordHash = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;
    const payload: any = {};
    if (data.nombre !== undefined) payload.nombre = data.nombre;
    if (data.email !== undefined) payload.email = data.email;
    if (data.telefono !== undefined) payload.telefono = data.telefono;
    if (data.municipioId !== undefined) payload.municipioId = data.municipioId;
    if (data.estado !== undefined) payload.estado = data.estado;
    if (passwordHash) payload.passwordHash = passwordHash;
    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: payload,
      select: SELECT_USUARIO,
    });

    if (userId) {
      await this.auditoria.logEvent("usuario", id, "UPDATE", userId, data);
    }

    return usuario;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: { deletedAt: new Date(), estado: false },
    });

    if (userId) {
      await this.auditoria.logEvent("usuario", id, "DELETE", userId);
    }

    return usuario;
  }

  async getRoles() {
    return this.prisma.rol.findMany({ orderBy: { nombre: "asc" } });
  }

  async asignarRol(usuarioId: string, rolId: string, userId?: string) {
    await this.findOne(usuarioId);
    const rol = await this.prisma.rol.findUnique({ where: { id: rolId } });
    if (!rol) throw new NotFoundException("Rol no encontrado");
    const result = await this.prisma.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId, rolId } },
      update: {},
      create: { usuarioId, rolId },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "usuario",
        usuarioId,
        "ASSIGN_ROLE",
        userId,
        { rolId },
      );
    }

    return result;
  }

  async quitarRol(usuarioId: string, rolId: string, userId?: string) {
    await this.findOne(usuarioId);
    const result = await this.prisma.usuarioRol.delete({
      where: { usuarioId_rolId: { usuarioId, rolId } },
    });

    if (userId) {
      await this.auditoria.logEvent(
        "usuario",
        usuarioId,
        "REMOVE_ROLE",
        userId,
        { rolId },
      );
    }

    return result;
  }
}
