import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CuadrillasService {
  private cuadrillas = [];

  create(data: any) {
    const cuadrilla = { id: `${Date.now()}`, ...data };
    this.cuadrillas.push(cuadrilla);
    return cuadrilla;
  }

  findAll(query: any) {
    return this.cuadrillas;
  }

  findOne(id: string) {
    const cuadrilla = this.cuadrillas.find((item) => item.id === id);
    if (!cuadrilla) throw new NotFoundException('Cuadrilla no encontrada');
    return cuadrilla;
  }

  update(id: string, data: any) {
    const cuadrilla = this.findOne(id);
    Object.assign(cuadrilla, data);
    return cuadrilla;
  }

  updateEstado(id: string, estado: string) {
    const cuadrilla = this.findOne(id);
    cuadrilla.estado = estado;
    return cuadrilla;
  }

  getOrdenes(id: string) {
    return [];
  }
}
