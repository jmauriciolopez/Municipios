import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { IncidentesService } from "./incidentes.service";
import { CreateIncidenteDto } from "./dto/create-incidente.dto";
import { UpdateIncidenteDto } from "./dto/update-incidente.dto";
import { FindIncidentesQueryDto } from "./dto/find-incidentes-query.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { User } from "../auth/user.decorator";

@Controller("incidentes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentesController {
  constructor(private readonly incidentesService: IncidentesService) {}

  @Post()
  @Roles("ADMIN", "SUPERVISOR", "INSPECTOR", "OPERARIO", "VECINO")
  create(@Body() body: CreateIncidenteDto, @User("id") userId: string) {
    return this.incidentesService.create(body, userId);
  }

  @Get()
  findAll(@Query() query: FindIncidentesQueryDto) {
    return this.incidentesService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.incidentesService.findOne(id);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPERVISOR", "INSPECTOR")
  update(
    @Param("id") id: string,
    @Body() body: UpdateIncidenteDto,
    @User("id") userId: string,
  ) {
    return this.incidentesService.update(id, body, userId);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.incidentesService.remove(id, userId);
  }

  @Post(":id/convertir-a-orden")
  @Roles("ADMIN", "SUPERVISOR", "INSPECTOR")
  convertToOrden(@Param("id") id: string, @User("id") userId: string) {
    return this.incidentesService.convertToOrden(id, userId);
  }

  @Get(":id/evidencias")
  getEvidencias(@Param("id") id: string) {
    return this.incidentesService.getEvidencias(id);
  }
}
