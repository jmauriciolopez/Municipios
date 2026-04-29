import { Module } from "@nestjs/common";
import { TiposActivoService } from "./tipos-activo.service";
import { TiposActivoController } from "./tipos-activo.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [TiposActivoController],
  providers: [TiposActivoService],
  exports: [TiposActivoService],
})
export class TiposActivoModule {}
