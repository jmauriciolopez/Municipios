import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ActivosService } from './activos.service';
import { CreateActivoDto } from './dto/create-activo.dto';
import { UpdateActivoDto } from './dto/update-activo.dto';

@Controller('activos')
export class ActivosController {
  constructor(private readonly activosService: ActivosService) {}

  @Post()
  create(@Body() createActivoDto: CreateActivoDto) {
    return this.activosService.create(createActivoDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.activosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivoDto: UpdateActivoDto) {
    return this.activosService.update(id, updateActivoDto);
  }

  @Get('cercanos')
  findNearby(@Query() query: { lat?: number; lng?: number; radio?: number }) {
    return this.activosService.findNearby(query);
  }
}
