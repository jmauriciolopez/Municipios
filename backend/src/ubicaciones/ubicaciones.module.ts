import { Module } from '@nestjs/common';
import { UbicacionesService } from './ubicaciones.service';
import { UbicacionesController } from './ubicaciones.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [UbicacionesController], providers: [UbicacionesService], exports: [UbicacionesService] })
export class UbicacionesModule {}
