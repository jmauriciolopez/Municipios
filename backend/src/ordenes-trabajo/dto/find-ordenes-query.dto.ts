import { IsOptional, IsEnum, IsUUID, IsDateString } from "class-validator";
import { OrdenEstado } from "../../common/enums/orden-estado.enum";
import { Prioridad } from "../../common/enums/prioridad.enum";

export class FindOrdenesQueryDto {
  @IsEnum(OrdenEstado)
  @IsOptional()
  estado?: OrdenEstado;

  @IsEnum(Prioridad)
  @IsOptional()
  prioridad?: Prioridad;

  @IsUUID()
  @IsOptional()
  area_id?: string;

  @IsUUID()
  @IsOptional()
  cuadrilla_id?: string;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}
