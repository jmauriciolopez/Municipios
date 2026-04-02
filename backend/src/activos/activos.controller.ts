import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ActivosService } from './activos.service';

@Controller('activos')
export class ActivosController {
  constructor(private readonly activosService: ActivosService) {}

  @Post()
  create(@Body() body: any) {
    return this.activosService.create(body);
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
  update(@Param('id') id: string, @Body() body: any) {
    return this.activosService.update(id, body);
  }

  @Get('cercanos')
  findNearby(@Query() query: { lat?: number; lng?: number; radio?: number }) {
    return this.activosService.findNearby(query);
  }
}
