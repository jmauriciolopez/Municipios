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
import { UsuariosService } from "./usuarios.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("usuarios")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.usuariosService.findAll(query);
  }

  @Get("roles")
  getRoles() {
    return this.usuariosService.getRoles();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() body: CreateUsuarioDto, @User("id") userId: string) {
    return this.usuariosService.create(body, userId);
  }

  @Patch(":id")
  @Roles("ADMIN")
  update(
    @Param("id") id: string,
    @Body() body: UpdateUsuarioDto,
    @User("id") userId: string,
  ) {
    return this.usuariosService.update(id, body, userId);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.usuariosService.remove(id, userId);
  }

  @Post(":id/roles/:rolId")
  @Roles("ADMIN")
  asignarRol(
    @Param("id") id: string,
    @Param("rolId") rolId: string,
    @User("id") userId: string,
  ) {
    return this.usuariosService.asignarRol(id, rolId, userId);
  }

  @Delete(":id/roles/:rolId")
  @Roles("ADMIN")
  quitarRol(
    @Param("id") id: string,
    @Param("rolId") rolId: string,
    @User("id") userId: string,
  ) {
    return this.usuariosService.quitarRol(id, rolId, userId);
  }
}
