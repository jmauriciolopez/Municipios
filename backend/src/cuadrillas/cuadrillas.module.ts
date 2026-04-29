import { Module } from "@nestjs/common";
import { CuadrillasService } from "./cuadrillas.service";
import { CuadrillasController } from "./cuadrillas.controller";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [AuditoriaModule],
  providers: [CuadrillasService],
  controllers: [CuadrillasController],
  exports: [CuadrillasService],
})
export class CuadrillasModule {}
