import { Module } from '@nestjs/common';
import { EvidenciasService } from './evidencias.service';
import { EvidenciasController } from './evidencias.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [EvidenciasController], providers: [EvidenciasService], exports: [EvidenciasService] })
export class EvidenciasModule {}
