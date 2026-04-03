import { Module } from '@nestjs/common';
import { TiposActivoService } from './tipos-activo.service';
import { TiposActivoController } from './tipos-activo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TiposActivoController],
  providers: [TiposActivoService],
  exports: [TiposActivoService],
})
export class TiposActivoModule {}
