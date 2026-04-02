import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdenesTrabajoService', () => {
  let service: OrdenesTrabajoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesTrabajoService,
        {
          provide: PrismaService,
          useValue: {
            ordenTrabajo: {
              findMany: jest.fn().mockResolvedValue([]),
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
            },
            evidencia: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrdenesTrabajoService>(OrdenesTrabajoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return array from prisma findMany', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});