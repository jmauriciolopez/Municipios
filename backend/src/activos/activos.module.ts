import { Module } from "@nestjs/common";
import { ActivosService } from "./activos.service";
import { ActivosController } from "./activos.controller";

import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [AuditoriaModule],
  providers: [ActivosService],
  controllers: [ActivosController],
  exports: [ActivosService],
})
export class ActivosModule {}
