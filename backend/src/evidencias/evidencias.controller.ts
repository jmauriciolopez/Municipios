import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EvidenciasService } from './evidencias.service';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('evidencias')
@UseGuards(JwtAuthGuard)
export class EvidenciasController {
  constructor(private readonly service: EvidenciasService) {}

  @Get()
  findByEntidad(@Query('entidad_tipo') tipo: string, @Query('entidad_id') id: string) {
    return this.service.findByEntidad(tipo, id);
  }

  @Post()
  create(@Body() body: CreateEvidenciaDto) { return this.service.create(body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
