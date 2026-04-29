import { IsUUID } from "class-validator";

export class AsignarCuadrillaDto {
  @IsUUID()
  cuadrilla_id: string;
}
