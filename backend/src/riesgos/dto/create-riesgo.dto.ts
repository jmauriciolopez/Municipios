import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateRiesgoDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  severidadBase?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsOptional()
  probabilidadBase?: number;

  @IsBoolean()
  @IsOptional()
  requiereAccionInmediata?: boolean;

  @IsBoolean()
  @IsOptional()
  esPreventivo?: boolean;

  @IsInt()
  @IsOptional()
  slaSugeridoHoras?: number;

  @IsString()
  @IsOptional()
  icono?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsUUID()
  @IsOptional()
  areaId?: string;

  @IsUUID()
  @IsOptional()
  categoriaId?: string;

  @IsUUID()
  @IsOptional()
  tipoActivoId?: string;
}
