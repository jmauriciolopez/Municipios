import { Module } from "@nestjs/common";
import { InventarioService } from "./inventario.service";
import { InventarioController } from "./inventario.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
