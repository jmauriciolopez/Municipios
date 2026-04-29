import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from "@nestjs/common";
import { AreasService } from "./areas.service";
import { CreateAreaDto } from "./dto/create-area.dto";
import { UpdateAreaDto } from "./dto/update-area.dto";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { User } from "../auth/user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("areas")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @Roles("ADMIN", "SUPERVISOR")
  create(@Body() createAreaDto: CreateAreaDto, @User("id") userId: string) {
    return this.areasService.create(createAreaDto, userId);
  }

  @Get()
  findAll() {
    return this.areasService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.areasService.findOne(id);
  }

  @Patch(":id")
  @Roles("ADMIN", "SUPERVISOR")
  update(
    @Param("id") id: string,
    @Body() updateAreaDto: UpdateAreaDto,
    @User("id") userId: string,
  ) {
    return this.areasService.update(id, updateAreaDto, userId);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.areasService.remove(id, userId);
  }
}
