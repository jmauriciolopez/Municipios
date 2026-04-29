import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { InspeccionesService } from "./inspecciones.service";
import { CreateInspeccionDto } from "./dto/create-inspeccion.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("inspecciones")
@UseGuards(JwtAuthGuard, RolesGuard)
export class InspeccionesController {
  constructor(private readonly service: InspeccionesService) {}
  @Get() findAll(@Query() q: any) {
    return this.service.findAll(q);
  }
  @Get(":id") findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }
  @Post() @Roles("ADMIN", "SUPERVISOR", "INSPECTOR") create(
    @Body() body: CreateInspeccionDto,
    @User("id") userId: string,
  ) {
    return this.service.create(body, userId);
  }
  @Patch(":id") @Roles("ADMIN", "SUPERVISOR", "INSPECTOR") update(
    @Param("id") id: string,
    @Body() body: Partial<CreateInspeccionDto>,
    @User("id") userId: string,
  ) {
    return this.service.update(id, body, userId);
  }
  @Delete(":id") @Roles("ADMIN") remove(
    @Param("id") id: string,
    @User("id") userId: string,
  ) {
    return this.service.remove(id, userId);
  }
}
