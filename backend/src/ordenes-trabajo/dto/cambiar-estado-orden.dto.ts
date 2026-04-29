import { IsEnum } from "class-validator";
import { OrdenEstado } from "../../common/enums/orden-estado.enum";

export class CambiarEstadoOrdenDto {
  @IsEnum(OrdenEstado)
  estado: OrdenEstado;
}
