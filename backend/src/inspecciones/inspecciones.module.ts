import { Module } from '@nestjs/common';
import { InspeccionesService } from './inspecciones.service';
import { InspeccionesController } from './inspecciones.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [InspeccionesController], providers: [InspeccionesService], exports: [InspeccionesService] })
export class InspeccionesModule {}
