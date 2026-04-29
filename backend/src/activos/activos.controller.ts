import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Delete,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";
import { ActivosService } from "./activos.service";
import { CreateActivoDto } from "./dto/create-activo.dto";
import { UpdateActivoDto } from "./dto/update-activo.dto";

@Controller("activos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivosController {
  constructor(private readonly activosService: ActivosService) {}

  @Post()
  @Roles("ADMIN", "SUPERVISOR")
  create(@Body() createActivoDto: CreateActivoDto, @User("id") userId: string) {
    return this.activosService.create(createActivoDto, userId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.activosService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.activosService.findOne(id);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.activosService.remove(id, userId);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPERVISOR")
  update(
    @Param("id") id: string,
    @Body() updateActivoDto: UpdateActivoDto,
    @User("id") userId: string,
  ) {
    return this.activosService.update(id, updateActivoDto, userId);
  }

  @Get("cercanos")
  findNearby(@Query() query: { lat?: number; lng?: number; radio?: number }) {
    return this.activosService.findNearby(query);
  }
}
