import { IsString, IsOptional } from 'class-validator';

export class CreateTipoActivoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
