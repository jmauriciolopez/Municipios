import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsUUID,
  Min,
  Max,
} from "class-validator";

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @Max(2)
  @IsOptional()
  nivel?: number;

  @IsUUID()
  @IsOptional()
  padreId?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsInt()
  @IsOptional()
  orden?: number;

  @IsString()
  @IsOptional()
  icono?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
