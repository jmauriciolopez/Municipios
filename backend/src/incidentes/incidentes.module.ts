import { Module } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { IncidentesController } from './incidentes.controller';

@Module({
  providers: [IncidentesService],
  controllers: [IncidentesController],
  exports: [IncidentesService],
})
export class IncidentesModule {}
