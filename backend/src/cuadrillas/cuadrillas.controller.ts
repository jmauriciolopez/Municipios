import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
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
}
