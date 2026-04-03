import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InspeccionesService } from './inspecciones.service';
import { CreateInspeccionDto } from './dto/create-inspeccion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inspecciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InspeccionesController {
  constructor(private readonly service: InspeccionesService) {}
  @Get() findAll(@Query() q: any) { return this.service.findAll(q); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles('admin', 'supervisor', 'inspector') create(@Body() body: CreateInspeccionDto) { return this.service.create(body); }
  @Patch(':id') @Roles('admin', 'supervisor', 'inspector') update(@Param('id') id: string, @Body() body: Partial<CreateInspeccionDto>) { return this.service.update(id, body); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
