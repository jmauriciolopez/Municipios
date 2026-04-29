import { Module } from "@nestjs/common";
import { UsuariosService } from "./usuarios.service";
import { UsuariosController } from "./usuarios.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { PersonasModule } from "../personas/personas.module";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [PrismaModule, PersonasModule, AuditoriaModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
