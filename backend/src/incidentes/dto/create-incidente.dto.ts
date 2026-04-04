import { IsUUID, IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { IncidenteEstado } from '../enums/incidente-estado.enum';
import { Prioridad } from '../../common/enums/prioridad.enum';

export class CreateIncidenteDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsEnum(IncidenteEstado)
  @IsOptional()
  estado?: IncidenteEstado;

  @IsEnum(Prioridad)
  @IsOptional()
  prioridad?: Prioridad;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsUUID()
  area_id: string;

  @IsUUID()
  @IsOptional()
  activo_id?: string;

  @IsUUID()
  @IsOptional()
  riesgo_id?: string;

  @IsUUID()
  @IsOptional()
  categoria_id?: string;

  @IsUUID()
  @IsOptional()
  reportado_por?: string;

  @IsDateString()
  @IsOptional()
  fecha_reporte?: string;
}
