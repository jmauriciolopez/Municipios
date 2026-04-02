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
  estado: IncidenteEstado;

  @IsEnum(Prioridad)
  prioridad: Prioridad;

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
  reportado_por: string;

  @IsDateString()
  @IsOptional()
  fecha_reporte?: string;
}
