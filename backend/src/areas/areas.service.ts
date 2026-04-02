import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AreasService {
  private areas = [];

  create(data: any) {
    const area = { id: `${Date.now()}`, ...data };
    this.areas.push(area);
    return area;
  }

  findAll() {
    return this.areas;
  }

  findOne(id: string) {
    const area = this.areas.find((item) => item.id === id);
    if (!area) throw new NotFoundException('Área no encontrada');
    return area;
  }

  update(id: string, data: any) {
    const area = this.findOne(id);
    Object.assign(area, data);
    return area;
  }

  remove(id: string) {
    const index = this.areas.findIndex((item) => item.id === id);
    if (index === -1) throw new NotFoundException('Área no encontrada');
    this.areas.splice(index, 1);
    return { deleted: true };
  }
}
