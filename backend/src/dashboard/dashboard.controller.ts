import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  getResumen() {
    return this.dashboardService.getResumen();
  }

  @Get('incidentes-por-estado')
  getIncidentesPorEstado() {
    return this.dashboardService.getIncidentesPorEstado();
  }

  @Get('ordenes-por-area')
  getOrdenesPorArea() {
    return this.dashboardService.getOrdenesPorArea();
  }

  @Get('tiempos-resolucion')
  getTiemposResolucion() {
    return this.dashboardService.getTiemposResolucion();
  }

  @Get('mapa-calor')
  getMapaCalor(@Query() query: any) {
    return this.dashboardService.getMapaCalor(query);
  }
}
