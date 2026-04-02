import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { CuadrillasService } from './cuadrillas.service';

@Controller('cuadrillas')
export class CuadrillasController {
  constructor(private readonly cuadrillasService: CuadrillasService) {}

  @Post()
  create(@Body() body: any) {
    return this.cuadrillasService.create(body);
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
  update(@Param('id') id: string, @Body() body: any) {
    return this.cuadrillasService.update(id, body);
  }

  @Patch(':id/disponibilidad')
  setDisponibilidad(@Param('id') id: string, @Body() body: { estado: string }) {
    return this.cuadrillasService.updateEstado(id, body.estado);
  }

  @Get(':id/ordenes')
  getOrdenes(@Param('id') id: string) {
    return this.cuadrillasService.getOrdenes(id);
  }
}
