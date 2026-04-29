import { Test, TestingModule } from "@nestjs/testing";
import { IncidentesService } from "./incidentes.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditoriaService } from "../auditoria/auditoria.service";

describe("IncidentesService", () => {
  let service: IncidentesService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncidentesService, PrismaService, AuditoriaService],
    }).compile();

    service = module.get<IncidentesService>(IncidentesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // Add more tests
});
