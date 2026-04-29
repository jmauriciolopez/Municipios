import { IsString, IsOptional, IsNumber, IsEnum } from "class-validator";
import { ActivoEstado } from "../../common/enums/activo-estado.enum";

export class CreateActivoDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  tipoActivoId: string;

  @IsOptional()
  @IsString()
  municipioId?: string;

  @IsOptional()
  @IsEnum(ActivoEstado)
  estado?: ActivoEstado;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  areaResponsableId?: string;
}
