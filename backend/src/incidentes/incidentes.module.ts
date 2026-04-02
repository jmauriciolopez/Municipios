import { Module } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { IncidentesController } from './incidentes.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [AuditoriaModule],
  providers: [IncidentesService],
  controllers: [IncidentesController],
  exports: [IncidentesService],
})
export class IncidentesModule {}
