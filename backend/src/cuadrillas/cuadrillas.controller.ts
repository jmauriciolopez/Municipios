import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CuadrillasService } from "./cuadrillas.service";
import { CreateCuadrillaDto } from "./dto/create-cuadrilla.dto";
import { UpdateCuadrillaDto } from "./dto/update-cuadrilla.dto";
import { CambiarEstadoCuadrillaDto } from "./dto/cambiar-estado-cuadrilla.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("cuadrillas")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CuadrillasController {
  constructor(private readonly cuadrillasService: CuadrillasService) {}

  @Post()
  @Roles("SUPERVISOR", "ADMIN")
  create(
    @Body() createCuadrillaDto: CreateCuadrillaDto,
    @User("id") userId: string,
  ) {
    return this.cuadrillasService.create(createCuadrillaDto, userId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.cuadrillasService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.cuadrillasService.findOne(id);
  }

  @Patch(":id")
  @Roles("SUPERVISOR", "ADMIN")
  update(
    @Param("id") id: string,
    @Body() updateCuadrillaDto: UpdateCuadrillaDto,
    @User("id") userId: string,
  ) {
    return this.cuadrillasService.update(id, updateCuadrillaDto, userId);
  }

  @Patch(":id/disponibilidad")
  @Roles("SUPERVISOR", "ADMIN")
  setDisponibilidad(
    @Param("id") id: string,
    @Body() cambiarEstadoCuadrillaDto: CambiarEstadoCuadrillaDto,
    @User("id") userId: string,
  ) {
    return this.cuadrillasService.updateEstado(
      id,
      cambiarEstadoCuadrillaDto,
      userId,
    );
  }

  @Get(":id/ordenes")
  getOrdenes(@Param("id") id: string) {
    return this.cuadrillasService.getOrdenes(id);
  }

  @Get(":id/miembros")
  getMiembros(@Param("id") id: string) {
    return this.cuadrillasService.getMiembros(id);
  }

  @Post(":id/miembros")
  @Roles("SUPERVISOR", "ADMIN")
  addMiembro(
    @Param("id") id: string,
    @Body() body: { personaId: string; rol?: string },
    @User("id") userId: string,
  ) {
    return this.cuadrillasService.addMiembro(id, body, userId);
  }

  @Delete(":id/miembros/:miembroId")
  @Roles("SUPERVISOR", "ADMIN")
  removeMiembro(
    @Param("id") id: string,
    @Param("miembroId") miembroId: string,
    @User("id") userId: string,
  ) {
    return this.cuadrillasService.removeMiembro(id, miembroId, userId);
  }
}
