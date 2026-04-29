import { IsString, IsEnum, IsOptional } from "class-validator";

export enum EvidenciaTipo {
  ANTES = "antes",
  DESPUES = "despues",
  INSPECCION = "inspeccion",
  INTERVENCION = "intervencion",
}

export class CreateEvidenciaDto {
  @IsString() entidadTipo: string;
  @IsString() entidadId: string;
  @IsString() url: string;
  @IsEnum(EvidenciaTipo) tipo: EvidenciaTipo;
  @IsString() @IsOptional() caption?: string;
  @IsString() @IsOptional() tomadoPor?: string;
}
