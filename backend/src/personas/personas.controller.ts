import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PersonasService } from "./personas.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("personas")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonasController {
  constructor(private readonly service: PersonasService) {}

  @Get()
  findAll(@Query() q: any) {
    return this.service.findAll(q);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles("ADMIN", "SUPERVISOR")
  create(@Body() body: CreatePersonaDto, @User("id") userId: string) {
    return this.service.create(body, userId);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPERVISOR")
  update(
    @Param("id") id: string,
    @Body() body: Partial<CreatePersonaDto>,
    @User("id") userId: string,
  ) {
    return this.service.update(id, body, userId);
  }

  @Patch(":id/toggle-activo")
  @Roles("ADMIN", "SUPERVISOR")
  toggleActivo(@Param("id") id: string, @User("id") userId: string) {
    return this.service.toggleActivo(id, userId);
  }
}
