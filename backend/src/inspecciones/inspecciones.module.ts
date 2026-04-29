import { Module } from "@nestjs/common";
import { InspeccionesService } from "./inspecciones.service";
import { InspeccionesController } from "./inspecciones.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [InspeccionesController],
  providers: [InspeccionesService],
  exports: [InspeccionesService],
})
export class InspeccionesModule {}
