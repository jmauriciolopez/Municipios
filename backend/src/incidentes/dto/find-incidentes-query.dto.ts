import { IsEnum, IsOptional, IsUUID, IsDateString } from "class-validator";
import { IncidenteEstado } from "../enums/incidente-estado.enum";
import { Prioridad } from "../../common/enums/prioridad.enum";

export class FindIncidentesQueryDto {
  @IsEnum(IncidenteEstado)
  @IsOptional()
  estado?: IncidenteEstado;

  @IsEnum(Prioridad)
  @IsOptional()
  prioridad?: Prioridad;

  @IsUUID()
  @IsOptional()
  area_id?: string;

  @IsDateString()
  @IsOptional()
  fecha_desde?: string;

  @IsDateString()
  @IsOptional()
  fecha_hasta?: string;
}
