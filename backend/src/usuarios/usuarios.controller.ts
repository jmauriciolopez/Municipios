import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.usuariosService.findAll(query);
  }

  @Get('roles')
  getRoles() {
    return this.usuariosService.getRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: CreateUsuarioDto) {
    return this.usuariosService.create(body);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: UpdateUsuarioDto) {
    return this.usuariosService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  @Post(':id/roles/:rolId')
  @Roles('admin')
  asignarRol(@Param('id') id: string, @Param('rolId') rolId: string) {
    return this.usuariosService.asignarRol(id, rolId);
  }

  @Delete(':id/roles/:rolId')
  @Roles('admin')
  quitarRol(@Param('id') id: string, @Param('rolId') rolId: string) {
    return this.usuariosService.quitarRol(id, rolId);
  }
}
