import { IsString, IsOptional, IsEmail } from "class-validator";

export class CreatePersonaDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
