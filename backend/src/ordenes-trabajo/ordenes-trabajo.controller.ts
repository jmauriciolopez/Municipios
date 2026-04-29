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
import { OrdenesTrabajoService } from "./ordenes-trabajo.service";
import { CreateOrdenTrabajoDto } from "./dto/create-orden-trabajo.dto";
import { UpdateOrdenTrabajoDto } from "./dto/update-orden-trabajo.dto";
import { AsignarCuadrillaDto } from "./dto/asignar-cuadrilla.dto";
import { CambiarEstadoOrdenDto } from "./dto/cambiar-estado-orden.dto";
import { FindOrdenesQueryDto } from "./dto/find-ordenes-query.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("ordenes-trabajo")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdenesTrabajoController {
  constructor(private readonly ordenesService: OrdenesTrabajoService) {}

  @Post()
  @Roles("INSPECTOR", "SUPERVISOR", "ADMIN")
  create(@Body() body: CreateOrdenTrabajoDto, @User("id") userId: string) {
    return this.ordenesService.create(body, userId);
  }

  @Get()
  findAll(@Query() query: FindOrdenesQueryDto) {
    return this.ordenesService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordenesService.findOne(id);
  }

  @Patch(":id")
  @Roles("SUPERVISOR", "ADMIN")
  update(
    @Param("id") id: string,
    @Body() body: UpdateOrdenTrabajoDto,
    @User("id") userId: string,
  ) {
    return this.ordenesService.update(id, body, userId);
  }

  @Patch(":id/asignar-cuadrilla")
  @Roles("SUPERVISOR", "ADMIN")
  asignarCuadrilla(
    @Param("id") id: string,
    @Body() body: AsignarCuadrillaDto,
    @User("id") userId: string,
  ) {
    return this.ordenesService.asignarCuadrilla(id, body, userId);
  }

  @Patch(":id/cambiar-estado")
  @Roles("SUPERVISOR", "ADMIN", "OPERARIO")
  cambiarEstado(
    @Param("id") id: string,
    @Body() body: CambiarEstadoOrdenDto,
    @User("id") userId: string,
  ) {
    return this.ordenesService.cambiarEstado(id, body, userId);
  }

  @Get(":id/evidencias")
  evidencias(@Param("id") id: string) {
    return this.ordenesService.getEvidencias(id);
  }

  @Get(":id/duracion")
  async duracion(@Param("id") id: string) {
    const orden = await this.ordenesService.findOne(id);
    return this.ordenesService.calcularDuracion(orden);
  }

  @Get(":id/materiales")
  getMateriales(@Param("id") id: string) {
    return this.ordenesService.getMateriales(id);
  }

  @Post(":id/materiales")
  @Roles("SUPERVISOR", "ADMIN", "OPERARIO")
  addMaterial(
    @Param("id") id: string,
    @Body()
    body: { item: string; cantidad: number; unidad: string; estado?: string },
    @User("id") userId: string,
  ) {
    return this.ordenesService.addMaterial(id, body, userId);
  }

  @Patch(":id/materiales/:materialId")
  @Roles("SUPERVISOR", "ADMIN", "OPERARIO")
  updateMaterial(
    @Param("id") id: string,
    @Param("materialId") materialId: string,
    @Body() body: any,
    @User("id") userId: string,
  ) {
    return this.ordenesService.updateMaterial(id, materialId, body, userId);
  }

  @Delete(":id/materiales/:materialId")
  @Roles("SUPERVISOR", "ADMIN")
  removeMaterial(
    @Param("id") id: string,
    @Param("materialId") materialId: string,
    @User("id") userId: string,
  ) {
    return this.ordenesService.removeMaterial(id, materialId, userId);
  }
}
