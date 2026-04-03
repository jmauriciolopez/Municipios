import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MunicipiosService } from './municipios.service';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('municipios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MunicipiosController {
  constructor(private readonly service: MunicipiosService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles('admin') create(@Body() body: CreateMunicipioDto) { return this.service.create(body); }
  @Patch(':id') @Roles('admin') update(@Param('id') id: string, @Body() body: Partial<CreateMunicipioDto>) { return this.service.update(id, body); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
