import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TiposActivoService } from './tipos-activo.service';
import { CreateTipoActivoDto } from './dto/create-tipo-activo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tipos-activo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TiposActivoController {
  constructor(private readonly service: TiposActivoService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'supervisor')
  create(@Body() body: CreateTipoActivoDto) { return this.service.create(body); }

  @Patch(':id')
  @Roles('admin', 'supervisor')
  update(@Param('id') id: string, @Body() body: Partial<CreateTipoActivoDto>) { return this.service.update(id, body); }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
