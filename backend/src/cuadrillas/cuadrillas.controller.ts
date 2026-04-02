import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { CuadrillasService } from './cuadrillas.service';
import { CreateCuadrillaDto } from './dto/create-cuadrilla.dto';
import { UpdateCuadrillaDto } from './dto/update-cuadrilla.dto';
import { CambiarEstadoCuadrillaDto } from './dto/cambiar-estado-cuadrilla.dto';

@Controller('cuadrillas')
export class CuadrillasController {
  constructor(private readonly cuadrillasService: CuadrillasService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updateCuadrillaDto: UpdateCuadrillaDto) {
    return this.cuadrillasService.update(id, updateCuadrillaDto);
  }

  @Patch(':id/disponibilidad')
  setDisponibilidad(@Param('id') id: string, @Body() cambiarEstadoCuadrillaDto: CambiarEstadoCuadrillaDto) {
    return this.cuadrillasService.updateEstado(id, cambiarEstadoCuadrillaDto);
  }

  @Get(':id/ordenes')
  getOrdenes(@Param('id') id: string) {
    return this.cuadrillasService.getOrdenes(id);
  }
}
