import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { AsignarCuadrillaDto } from './dto/asignar-cuadrilla.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';
import { FindOrdenesQueryDto } from './dto/find-ordenes-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ordenes-trabajo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdenesTrabajoController {
  constructor(private readonly ordenesService: OrdenesTrabajoService) {}

  @Post()
  @Roles('inspector', 'supervisor', 'admin')
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
  @Roles('supervisor', 'admin')
  update(@Param('id') id: string, @Body() body: UpdateOrdenTrabajoDto) {
    return this.ordenesService.update(id, body);
  }

  @Patch(':id/asignar-cuadrilla')
  @Roles('supervisor', 'admin')
  asignarCuadrilla(@Param('id') id: string, @Body() body: AsignarCuadrillaDto) {
    return this.ordenesService.asignarCuadrilla(id, body);
  }

  @Patch(':id/cambiar-estado')
  @Roles('supervisor', 'admin', 'operario')
  cambiarEstado(@Param('id') id: string, @Body() body: CambiarEstadoOrdenDto) {
    return this.ordenesService.cambiarEstado(id, body);
  }

  @Get(':id/evidencias')
  evidencias(@Param('id') id: string) {
    return this.ordenesService.getEvidencias(id);
  }

  @Get(':id/duracion')
  async duracion(@Param('id') id: string) {
    const orden = await this.ordenesService.findOne(id);
    return this.ordenesService.calcularDuracion(orden);
  }

  @Get(':id/materiales')
  getMateriales(@Param('id') id: string) {
    return this.ordenesService.getMateriales(id);
  }

  @Post(':id/materiales')
  @Roles('supervisor', 'admin', 'operario')
  addMaterial(@Param('id') id: string, @Body() body: { item: string; cantidad: number; unidad: string; estado?: string }) {
    return this.ordenesService.addMaterial(id, body);
  }

  @Patch(':id/materiales/:materialId')
  @Roles('supervisor', 'admin', 'operario')
  updateMaterial(@Param('id') id: string, @Param('materialId') materialId: string, @Body() body: any) {
    return this.ordenesService.updateMaterial(id, materialId, body);
  }

  @Delete(':id/materiales/:materialId')
  @Roles('supervisor', 'admin')
  removeMaterial(@Param('id') id: string, @Param('materialId') materialId: string) {
    return this.ordenesService.removeMaterial(id, materialId);
  }
}