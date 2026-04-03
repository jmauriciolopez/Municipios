import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async logEvent(
    entidadTipo: string,
    entidadId: string,
    accion: string,
    usuarioId?: string,
    datos?: any
  ) {
    try {
      await this.prisma.auditoriaEvento.create({
        data: {
          entidadTipo,
          entidadId,
          accion,
          usuarioId,
          datos,
        },
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Error logging audit event:', error);
    }
  }

  async getAuditTrail(entidadTipo: string, entidadId: string) {
    return this.prisma.auditoriaEvento.findMany({
      where: { entidadTipo, entidadId },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserActivity(usuarioId: string, limit = 50) {
    return this.prisma.auditoriaEvento.findMany({
      where: { usuarioId },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecent(limit = 100) {
    return this.prisma.auditoriaEvento.findMany({
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}