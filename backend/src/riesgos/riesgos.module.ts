import { Module } from "@nestjs/common";
import { RiesgosService } from "./riesgos.service";
import { RiesgosController } from "./riesgos.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [RiesgosController],
  providers: [RiesgosService],
  exports: [RiesgosService],
})
export class RiesgosModule {}
