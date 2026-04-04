import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RiesgosService } from './riesgos.service';
import { CreateRiesgoDto } from './dto/create-riesgo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('riesgos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiesgosController {
  constructor(private readonly service: RiesgosService) {}

  @Get() findAll(@Query() q: any) { return this.service.findAll(q); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles('admin', 'supervisor', 'inspector') create(@Body() body: CreateRiesgoDto) { return this.service.create(body); }
  @Patch(':id') @Roles('admin', 'supervisor', 'inspector') update(@Param('id') id: string, @Body() body: Partial<CreateRiesgoDto>) { return this.service.update(id, body); }
  @Patch(':id/toggle-activo') @Roles('admin', 'supervisor') toggleActivo(@Param('id') id: string) { return this.service.toggleActivo(id); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
