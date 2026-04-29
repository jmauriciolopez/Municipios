import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { TiposActivoService } from "./tipos-activo.service";
import { CreateTipoActivoDto } from "./dto/create-tipo-activo.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("tipos-activo")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TiposActivoController {
  constructor(private readonly service: TiposActivoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles("ADMIN", "SUPERVISOR")
  create(@Body() body: CreateTipoActivoDto, @User("id") userId: string) {
    return this.service.create(body, userId);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPERVISOR")
  update(
    @Param("id") id: string,
    @Body() body: Partial<CreateTipoActivoDto>,
    @User("id") userId: string,
  ) {
    return this.service.update(id, body, userId);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.service.remove(id, userId);
  }
}
