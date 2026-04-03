import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRiesgoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  nivel: number;

  @IsString()
  @IsOptional()
  areaId?: string;
}
