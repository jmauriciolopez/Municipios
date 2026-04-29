import { Module } from "@nestjs/common";
import { MunicipiosService } from "./municipios.service";
import { MunicipiosController } from "./municipios.controller";
import { PrismaModule } from "../prisma/prisma.module";

import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [MunicipiosController],
  providers: [MunicipiosService],
  exports: [MunicipiosService],
})
export class MunicipiosModule {}
