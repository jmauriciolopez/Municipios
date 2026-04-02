import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ActivosService {
  private activos = [];

  create(data: any) {
    const activo = { id: `${Date.now()}`, ...data };
    this.activos.push(activo);
    return activo;
  }

  findAll(query: any) {
    return this.activos;
  }

  findOne(id: string) {
    const activo = this.activos.find((item) => item.id === id);
    if (!activo) throw new NotFoundException('Activo no encontrado');
    return activo;
  }

  update(id: string, data: any) {
    const activo = this.findOne(id);
    Object.assign(activo, data);
    return activo;
  }

  findNearby(query: { lat?: number; lng?: number; radio?: number }) {
    return this.activos;
  }
}
