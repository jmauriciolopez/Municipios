import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { IncidentesModule } from './incidentes/incidentes.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';
import { ActivosModule } from './activos/activos.module';
import { CuadrillasModule } from './cuadrillas/cuadrillas.module';
import { AreasModule } from './areas/areas.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    IncidentesModule,
    OrdenesTrabajoModule,
    ActivosModule,
    CuadrillasModule,
    AreasModule,
    DashboardModule,
    AuthModule,
    AuditoriaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
