import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'supervisor')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  getAll(@Query() query: { entidad_tipo?: string; entidad_id?: string; usuario_id?: string; limit?: string }) {
    if (query.entidad_tipo && query.entidad_id) {
      return this.auditoriaService.getAuditTrail(query.entidad_tipo, query.entidad_id);
    }
    if (query.usuario_id) {
      return this.auditoriaService.getUserActivity(query.usuario_id, query.limit ? Number(query.limit) : 50);
    }
    return this.auditoriaService.getRecent(query.limit ? Number(query.limit) : 100);
  }

  @Get('entidad/:tipo/:id')
  getTrail(@Param('tipo') tipo: string, @Param('id') id: string) {
    return this.auditoriaService.getAuditTrail(tipo, id);
  }

  @Get('usuario/:id')
  getUserActivity(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.auditoriaService.getUserActivity(id, limit ? Number(limit) : 50);
  }
}
