import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { CuadrillasService } from './cuadrillas.service';
import { CreateCuadrillaDto } from './dto/create-cuadrilla.dto';
import { UpdateCuadrillaDto } from './dto/update-cuadrilla.dto';
import { CambiarEstadoCuadrillaDto } from './dto/cambiar-estado-cuadrilla.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cuadrillas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CuadrillasController {
  constructor(private readonly cuadrillasService: CuadrillasService) {}

  @Post()
  @Roles('supervisor', 'admin')
  create(@Body() createCuadrillaDto: CreateCuadrillaDto) {
    return this.cuadrillasService.create(createCuadrillaDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.cuadrillasService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuadrillasService.findOne(id);
  }

  @Patch(':id')
  @Roles('supervisor', 'admin')
  update(@Param('id') id: string, @Body() updateCuadrillaDto: UpdateCuadrillaDto) {
    return this.cuadrillasService.update(id, updateCuadrillaDto);
  }

  @Patch(':id/disponibilidad')
  @Roles('supervisor', 'admin')
  setDisponibilidad(@Param('id') id: string, @Body() cambiarEstadoCuadrillaDto: CambiarEstadoCuadrillaDto) {
    return this.cuadrillasService.updateEstado(id, cambiarEstadoCuadrillaDto);
  }

  @Get(':id/ordenes')
  getOrdenes(@Param('id') id: string) {
    return this.cuadrillasService.getOrdenes(id);
  }

  @Get(':id/miembros')
  getMiembros(@Param('id') id: string) {
    return this.cuadrillasService.getMiembros(id);
  }

  @Post(':id/miembros')
  @Roles('supervisor', 'admin')
  addMiembro(@Param('id') id: string, @Body() body: { usuarioId: string; rol?: string }) {
    return this.cuadrillasService.addMiembro(id, body);
  }

  @Delete(':id/miembros/:miembroId')
  @Roles('supervisor', 'admin')
  removeMiembro(@Param('id') id: string, @Param('miembroId') miembroId: string) {
    return this.cuadrillasService.removeMiembro(id, miembroId);
  }
}