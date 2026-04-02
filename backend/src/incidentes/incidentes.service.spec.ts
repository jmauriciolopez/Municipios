import { Test, TestingModule } from '@nestjs/testing';
import { IncidentesService } from './incidentes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IncidentesService', () => {
  let service: IncidentesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncidentesService, PrismaService],
    }).compile();

    service = module.get<IncidentesService>(IncidentesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests
});