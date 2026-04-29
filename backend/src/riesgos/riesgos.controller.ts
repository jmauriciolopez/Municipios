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
import { RiesgosService } from "./riesgos.service";
import { CreateRiesgoDto } from "./dto/create-riesgo.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("riesgos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiesgosController {
  constructor(private readonly service: RiesgosService) {}

  @Get()
  findAll(@Query() q: any) {
    return this.service.findAll(q);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles("ADMIN", "SUPERVISOR", "INSPECTOR")
  create(@Body() body: CreateRiesgoDto, @User("id") userId: string) {
    return this.service.create(body, userId);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPERVISOR", "INSPECTOR")
  update(
    @Param("id") id: string,
    @Body() body: Partial<CreateRiesgoDto>,
    @User("id") userId: string,
  ) {
    return this.service.update(id, body, userId);
  }

  @Patch(":id/toggle-activo")
  @Roles("ADMIN", "SUPERVISOR")
  toggleActivo(@Param("id") id: string, @User("id") userId: string) {
    return this.service.toggleActivo(id, userId);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.service.remove(id, userId);
  }
}
