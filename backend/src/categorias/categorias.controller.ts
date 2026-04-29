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
import { CategoriasService } from "./categorias.service";
import { CreateCategoriaDto } from "./dto/create-categoria.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("categorias")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Get()
  findAll(@Query("activo") activo?: string) {
    return this.service.findAll(activo === "true" ? true : undefined);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles("ADMIN", "SUPERVISOR")
  create(@Body() body: CreateCategoriaDto, @User("id") userId: string) {
    return this.service.create(body, userId);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPERVISOR")
  update(
    @Param("id") id: string,
    @Body() body: UpdateCategoriaDto,
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
