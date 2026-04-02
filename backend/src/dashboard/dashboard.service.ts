import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncidenteEstado } from '../common/enums/incidente-estado.enum';
import { OrdenEstado } from '../common/enums/orden-estado.enum';
import { Prioridad } from '../common/enums/prioridad.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getResumen() {
    const [totalIncidentes, totalOrdenes, ordenesEnProceso, incidentesCriticos] = await Promise.all([
      this.prisma.incidente.count({ where: { deletedAt: null } }),
      this.prisma.ordenTrabajo.count({ where: { deletedAt: null } }),
      this.prisma.ordenTrabajo.count({ where: { deletedAt: null, estado: OrdenEstado.EN_PROCESO } }),
      this.prisma.incidente.count({ where: { deletedAt: null, prioridad: Prioridad.CRITICA } }),
    ]);

    return {
      totalIncidentes,
      totalOrdenes,
      ordenesEnProceso,
      incidentesCriticos,
    };
  }

  async getIncidentesPorEstado() {
    const result = await this.prisma.incidente.groupBy({
      by: ['estado'],
      where: { deletedAt: null },
      _count: { estado: true },
    });

    return result.map(item => ({
      estado: item.estado,
      cantidad: item._count.estado,
    }));
  }

  async getOrdenesPorArea() {
    const ordenes = await this.prisma.ordenTrabajo.findMany({
      where: { deletedAt: null },
      include: {
        area: true,
      },
    });

    const grouped = ordenes.reduce((acc, orden) => {
      const areaNombre = orden.area?.nombre || 'Sin área';
      acc[areaNombre] = (acc[areaNombre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([area, cantidad]) => ({
      area,
      cantidad,
    }));
  }

  async getTiemposResolucion() {
    const ordenes = await this.prisma.ordenTrabajo.findMany({
      where: {
        deletedAt: null,
        fechaInicio: { not: null },
        fechaCierre: { not: null },
      },
      select: {
        fechaInicio: true,
        fechaCierre: true,
      },
    });

    if (ordenes.length === 0) {
      return { promedioHoras: 0, desviacion: 0 };
    }

    const tiempos = ordenes.map(orden => {
      const inicio = new Date(orden.fechaInicio!);
      const cierre = new Date(orden.fechaCierre!);
      return (cierre.getTime() - inicio.getTime()) / (1000 * 60 * 60); // horas
    });

    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    const varianza = tiempos.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / tiempos.length;
    const desviacion = Math.sqrt(varianza);

    return {
      promedioHoras: Math.round(promedio * 100) / 100,
      desviacion: Math.round(desviacion * 100) / 100,
    };
  }

  async getMapaCalor(query: any) {
    const incidentes = await this.prisma.incidente.findMany({
      where: { deletedAt: null },
      select: {
        lat: true,
        lng: true,
        prioridad: true,
      },
    });

    const puntos = incidentes.map(incidente => ({
      lat: incidente.lat.toNumber(),
      lng: incidente.lng.toNumber(),
      intensidad: incidente.prioridad === Prioridad.CRITICA ? 3 : incidente.prioridad === Prioridad.ALTA ? 2 : 1,
    }));

    return { puntos };
  }
}
