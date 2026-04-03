import { Module } from '@nestjs/common';
import { RiesgosService } from './riesgos.service';
import { RiesgosController } from './riesgos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [RiesgosController], providers: [RiesgosService], exports: [RiesgosService] })
export class RiesgosModule {}
