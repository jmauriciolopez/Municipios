import { IsString } from "class-validator";

export class CreateMunicipioDto {
  @IsString() nombre: string;
  @IsString() codigo: string;
}
