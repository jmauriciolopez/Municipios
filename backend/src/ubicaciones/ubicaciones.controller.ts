import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { UbicacionesService } from './ubicaciones.service';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ubicaciones')
@UseGuards(JwtAuthGuard)
export class UbicacionesController {
  constructor(private readonly service: UbicacionesService) {}
  @Get() findAll(@Query() q: any) { return this.service.findAll(q); }
  @Post() create(@Body() body: CreateUbicacionDto) { return this.service.create(body); }
}
