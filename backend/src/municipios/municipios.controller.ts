import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { MunicipiosService } from "./municipios.service";
import { CreateMunicipioDto } from "./dto/create-municipio.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("municipios")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MunicipiosController {
  constructor(private readonly service: MunicipiosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() body: CreateMunicipioDto, @User("id") userId: string) {
    return this.service.create(body, userId);
  }

  @Patch(":id")
  @Roles("ADMIN")
  update(
    @Param("id") id: string,
    @Body() body: Partial<CreateMunicipioDto>,
    @User("id") userId: string,
  ) {
    return this.service.update(id, body, userId);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.service.remove(id, userId);
  }
}
