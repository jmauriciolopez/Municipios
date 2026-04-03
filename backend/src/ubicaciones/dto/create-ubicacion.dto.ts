import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUbicacionDto {
  @IsString() entidadTipo: string;
  @IsString() entidadId: string;
  @IsNumber() @Type(() => Number) lat: number;
  @IsNumber() @Type(() => Number) lng: number;
  @IsString() @IsOptional() direccion?: string;
}
