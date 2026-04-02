import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AreasService } from './areas.service';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  create(@Body() body: any) {
    return this.areasService.create(body);
  }

  @Get()
  findAll() {
    return this.areasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.areasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.areasService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.areasService.remove(id);
  }
}
