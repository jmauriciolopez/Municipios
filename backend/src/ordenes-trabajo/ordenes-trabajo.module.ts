import { Module } from '@nestjs/common';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { OrdenesTrabajoController } from './ordenes-trabajo.controller';

@Module({
  providers: [OrdenesTrabajoService],
  controllers: [OrdenesTrabajoController],
  exports: [OrdenesTrabajoService],
})
export class OrdenesTrabajoModule {}
