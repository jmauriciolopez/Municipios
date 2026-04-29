import { Module } from "@nestjs/common";
import { AreasService } from "./areas.service";
import { AreasController } from "./areas.controller";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [AuditoriaModule],
  providers: [AreasService],
  controllers: [AreasController],
  exports: [AreasService],
})
export class AreasModule {}
