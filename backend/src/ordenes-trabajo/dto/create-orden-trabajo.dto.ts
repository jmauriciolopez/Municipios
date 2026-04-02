import { IsUUID, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { OrdenEstado } from '../../common/enums/orden-estado.enum';
import { Prioridad } from '../../common/enums/prioridad.enum';

export class CreateOrdenTrabajoDto {
  @IsString()
  codigo: string;

  @IsUUID()
  @IsOptional()
  incidente_id?: string;

  @IsUUID()
  @IsOptional()
  area_id?: string;

  @IsUUID()
  @IsOptional()
  cuadrilla_id?: string;

  @IsEnum(OrdenEstado)
  @IsOptional()
  estado?: OrdenEstado;

  @IsEnum(Prioridad)
  @IsOptional()
  prioridad?: Prioridad;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha_asignacion?: string;

  @IsDateString()
  @IsOptional()
  fecha_inicio?: string;

  @IsDateString()
  @IsOptional()
  fecha_cierre?: string;
}
