import { IsEnum } from 'class-validator';
import { CuadrillaEstado } from '../../common/enums/cuadrilla-estado.enum';

export class CambiarEstadoCuadrillaDto {
  @IsEnum(CuadrillaEstado)
  estado: CuadrillaEstado;
}