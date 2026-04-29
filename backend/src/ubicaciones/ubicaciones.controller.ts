import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { UbicacionesService } from "./ubicaciones.service";
import { CreateUbicacionDto } from "./dto/create-ubicacion.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("ubicaciones")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UbicacionesController {
  constructor(private readonly service: UbicacionesService) {}

  @Get()
  findAll(@Query() q: any) {
    return this.service.findAll(q);
  }

  @Post()
  @Roles("ADMIN", "SUPERVISOR", "INSPECTOR", "OPERARIO")
  create(@Body() body: CreateUbicacionDto, @User("id") userId: string) {
    return this.service.create(body, userId);
  }
}
