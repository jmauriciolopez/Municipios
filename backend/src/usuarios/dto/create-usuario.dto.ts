import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  municipioId?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
