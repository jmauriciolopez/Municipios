import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { InventarioService } from "./inventario.service";
import { CreateInventarioItemDto } from "./dto/create-inventario-item.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("inventario")
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventarioController {
  constructor(private readonly service: InventarioService) {}
  @Get() findAll(@Query() q: any) {
    return this.service.findAll(q);
  }
  @Get(":id") findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }
  @Post() @Roles("ADMIN", "SUPERVISOR") create(
    @Body() body: CreateInventarioItemDto,
    @User("id") userId: string,
  ) {
    return this.service.create(body, userId);
  }
  @Patch(":id") @Roles("ADMIN", "SUPERVISOR") update(
    @Param("id") id: string,
    @Body() body: Partial<CreateInventarioItemDto>,
    @User("id") userId: string,
  ) {
    return this.service.update(id, body, userId);
  }
  @Patch(":id/ajustar") @Roles("ADMIN", "SUPERVISOR", "OPERARIO") ajustar(
    @Param("id") id: string,
    @Body() body: { delta: number },
    @User("id") userId: string,
  ) {
    return this.service.ajustarCantidad(id, body.delta, userId);
  }
  @Delete(":id") @Roles("ADMIN") remove(
    @Param("id") id: string,
    @User("id") userId: string,
  ) {
    return this.service.remove(id, userId);
  }
}
