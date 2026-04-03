import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateInspeccionDto {
  @IsString()
  incidenteId: string;

  @IsString()
  @IsOptional()
  activoId?: string;

  @IsString()
  @IsOptional()
  inspectorId?: string;

  @IsString()
  @IsOptional()
  areaId?: string;

  @IsString()
  @IsOptional()
  resultado?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsDateString()
  @IsOptional()
  fechaInspeccion?: string;
}
