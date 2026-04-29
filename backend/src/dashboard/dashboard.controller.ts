import { Controller, Get, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("resumen")
  getResumen() {
    return this.dashboardService.getResumen();
  }

  @Get("incidentes-por-estado")
  getIncidentesPorEstado() {
    return this.dashboardService.getIncidentesPorEstado();
  }

  @Get("ordenes-por-area")
  getOrdenesPorArea() {
    return this.dashboardService.getOrdenesPorArea();
  }

  @Get("tiempos-resolucion")
  getTiemposResolucion() {
    return this.dashboardService.getTiemposResolucion();
  }

  @Get("mapa-calor")
  getMapaCalor() {
    return this.dashboardService.getMapaCalor();
  }
}
