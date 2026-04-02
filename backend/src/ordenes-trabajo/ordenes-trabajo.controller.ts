import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { AsignarCuadrillaDto } from './dto/asignar-cuadrilla.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';
import { FindOrdenesQueryDto } from './dto/find-ordenes-query.dto';

@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(private readonly ordenesService: OrdenesTrabajoService) {}

  @Post()
  create(@Body() body: CreateOrdenTrabajoDto) {
    return this.ordenesService.create(body);
  }

  @Get()
  findAll(@Query() query: FindOrdenesQueryDto) {
    return this.ordenesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateOrdenTrabajoDto) {
    return this.ordenesService.update(id, body);
  }

  @Patch(':id/asignar-cuadrilla')
  asignarCuadrilla(@Param('id') id: string, @Body() body: AsignarCuadrillaDto) {
    return this.ordenesService.asignarCuadrilla(id, body);
  }

  @Patch(':id/cambiar-estado')
  cambiarEstado(@Param('id') id: string, @Body() body: CambiarEstadoOrdenDto) {
    return this.ordenesService.cambiarEstado(id, body);
  }

  @Get(':id/evidencias')
  evidencias(@Param('id') id: string) {
    return this.ordenesService.getEvidencias(id);
  }

  @Get(':id/duracion')
  duracion(@Param('id') id: string) {
    const orden = this.ordenesService.findOne(id);
    return this.ordenesService.calcularDuracion(orden);
  }
}
