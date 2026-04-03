import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('personas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonasController {
  constructor(private readonly service: PersonasService) {}

  @Get()
  findAll(@Query() q: any) { return this.service.findAll(q); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'supervisor')
  create(@Body() body: CreatePersonaDto) { return this.service.create(body); }

  @Patch(':id')
  @Roles('admin', 'supervisor')
  update(@Param('id') id: string, @Body() body: Partial<CreatePersonaDto>) { return this.service.update(id, body); }

  @Patch(':id/toggle-activo')
  @Roles('admin', 'supervisor')
  toggleActivo(@Param('id') id: string) { return this.service.toggleActivo(id); }
}
