import { Module } from "@nestjs/common";
import { OrdenesTrabajoService } from "./ordenes-trabajo.service";
import { OrdenesTrabajoController } from "./ordenes-trabajo.controller";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [AuditoriaModule],
  providers: [OrdenesTrabajoService],
  controllers: [OrdenesTrabajoController],
  exports: [OrdenesTrabajoService],
})
export class OrdenesTrabajoModule {}
