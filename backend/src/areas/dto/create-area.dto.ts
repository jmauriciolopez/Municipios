import { IsString, IsOptional } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  municipioId: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}