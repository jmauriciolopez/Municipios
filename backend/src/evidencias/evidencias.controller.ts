import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { EvidenciasService } from "./evidencias.service";
import { CreateEvidenciaDto } from "./dto/create-evidencia.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("evidencias")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvidenciasController {
  constructor(private readonly service: EvidenciasService) {}

  @Get()
  findByEntidad(
    @Query("entidad_tipo") tipo: string,
    @Query("entidad_id") id: string,
  ) {
    return this.service.findByEntidad(tipo, id);
  }

  @Post()
  @Roles("ADMIN", "SUPERVISOR", "INSPECTOR", "OPERARIO")
  create(@Body() body: CreateEvidenciaDto, @User("id") userId: string) {
    return this.service.create(body, userId);
  }

  @Delete(":id")
  @Roles("ADMIN", "SUPERVISOR")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.service.remove(id, userId);
  }
}
