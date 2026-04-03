import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';

@Injectable()
export class EvidenciasService {
  constructor(private readonly prisma: PrismaService) {}

  findByEntidad(entidadTipo: string, entidadId: string) {
    return this.prisma.evidencia.findMany({
      where: { entidadTipo, entidadId, deletedAt: null },
      include: { tomadoPorU: { select: { id: true, nombre: true, email: true } } },
      orderBy: { timestampFoto: 'desc' },
    });
  }

  create(data: CreateEvidenciaDto) {
    return this.prisma.evidencia.create({
      data: { entidadTipo: data.entidadTipo, entidadId: data.entidadId, url: data.url, tipo: data.tipo as any, caption: data.caption, tomadoPor: data.tomadoPor },
      include: { tomadoPorU: { select: { id: true, nombre: true, email: true } } },
    });
  }

  async remove(id: string) {
    const e = await this.prisma.evidencia.findFirst({ where: { id, deletedAt: null } });
    if (!e) throw new NotFoundException('Evidencia no encontrada');
    return this.prisma.evidencia.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
