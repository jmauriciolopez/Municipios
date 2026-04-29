import { IsString, IsOptional, IsEnum } from "class-validator";
import { CuadrillaEstado } from "../../common/enums/cuadrilla-estado.enum";

export class CreateCuadrillaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  municipioId?: string;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @IsEnum(CuadrillaEstado)
  estado?: CuadrillaEstado;

  @IsOptional()
  @IsString()
  supervisorId?: string;
}
