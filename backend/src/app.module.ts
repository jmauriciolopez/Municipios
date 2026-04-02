import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { IncidentesModule } from './incidentes/incidentes.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';
import { ActivosModule } from './activos/activos.module';
import { CuadrillasModule } from './cuadrillas/cuadrillas.module';
import { AreasModule } from './areas/areas.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    IncidentesModule,
    OrdenesTrabajoModule,
    ActivosModule,
    CuadrillasModule,
    AreasModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
