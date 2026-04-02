import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { IncidentesService } from './incidentes.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { FindIncidentesQueryDto } from './dto/find-incidentes-query.dto';

@Controller('incidentes')
export class IncidentesController {
  constructor(private readonly incidentesService: IncidentesService) {}

  @Post()
  create(@Body() body: CreateIncidenteDto) {
    return this.incidentesService.create(body);
  }

  @Get()
  findAll(@Query() query: FindIncidentesQueryDto) {
    return this.incidentesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.incidentesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentesService.remove(id);
  }

  @Post(':id/convertir-a-orden')
  convertToOrden(@Param('id') id: string) {
    return this.incidentesService.convertToOrden(id);
  }

  @Get(':id/evidencias')
  getEvidencias(@Param('id') id: string) {
    return this.incidentesService.getEvidencias(id);
  }
}
