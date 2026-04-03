import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioItemDto } from './dto/create-inventario-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inventario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventarioController {
  constructor(private readonly service: InventarioService) {}
  @Get() findAll(@Query() q: any) { return this.service.findAll(q); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles('admin', 'supervisor') create(@Body() body: CreateInventarioItemDto) { return this.service.create(body); }
  @Patch(':id') @Roles('admin', 'supervisor') update(@Param('id') id: string, @Body() body: Partial<CreateInventarioItemDto>) { return this.service.update(id, body); }
  @Patch(':id/ajustar') @Roles('admin', 'supervisor', 'operario') ajustar(@Param('id') id: string, @Body() body: { delta: number }) { return this.service.ajustarCantidad(id, body.delta); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
