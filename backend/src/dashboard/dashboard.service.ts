import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getResumen() {
    return {
      totalIncidentes: 0,
      totalOrdenes: 0,
      ordenesEnProceso: 0,
      incidentesCriticos: 0,
    };
  }

  getIncidentesPorEstado() {
    return [
      { estado: 'abierto', cantidad: 0 },
      { estado: 'en_proceso', cantidad: 0 },
      { estado: 'resuelto', cantidad: 0 },
    ];
  }

  getOrdenesPorArea() {
    return [{ area: 'Poda', cantidad: 0 }, { area: 'Luminaria', cantidad: 0 }];
  }

  getTiemposResolucion() {
    return { promedioHoras: 0, desviacion: 0 };
  }

  getMapaCalor(query: any) {
    return { puntos: [] };
  }
}
