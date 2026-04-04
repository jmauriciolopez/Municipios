import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  // Municipio demo
  const municipio = await prisma.municipio.upsert({
    where: { codigo: 'MUNICIPIO_DEMO' },
    update: {},
    create: {
      nombre: 'Municipio Demo',
      codigo: 'MUNICIPIO_DEMO',
    },
  });

  // Áreas
  const areaPoda = await prisma.area.upsert({
    where: { municipioId_nombre: { municipioId: municipio.id, nombre: 'Poda' } },
    update: {},
    create: {
      municipioId: municipio.id,
      nombre: 'Poda',
      descripcion: 'Área de poda de árboles',
    },
  });

  const areaLuminaria = await prisma.area.upsert({
    where: { municipioId_nombre: { municipioId: municipio.id, nombre: 'Luminaria' } },
    update: {},
    create: {
      municipioId: municipio.id,
      nombre: 'Luminaria',
      descripcion: 'Área de mantenimiento de luminarias',
    },
  });

  // Roles
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      descripcion: 'Usuario con acceso completo',
    },
  });

  const rolSupervisor = await prisma.rol.upsert({
    where: { nombre: 'supervisor' },
    update: {},
    create: {
      nombre: 'supervisor',
      descripcion: 'Supervisor de cuadrillas',
    },
  });

  const rolInspector = await prisma.rol.upsert({
    where: { nombre: 'inspector' },
    update: {},
    create: {
      nombre: 'inspector',
      descripcion: 'Inspector de riesgos e incidentes',
    },
  });

  const rolOperario = await prisma.rol.upsert({
    where: { nombre: 'operario' },
    update: {},
    create: {
      nombre: 'operario',
      descripcion: 'Usuario de campo',
    },
  });

  // Usuarios
  const passwordHash = await import('bcryptjs').then((bcrypt) => bcrypt.hash('secret', 10));

  const existingAdmin = await prisma.usuario.findFirst({ where: { email: 'admin@municipio.com' } });
  const userAdmin = existingAdmin ?? await prisma.usuario.create({
    data: {
      municipioId: municipio.id,
      nombre: 'Administrador',
      email: 'admin@municipio.com',
      passwordHash,
      roles: {
        create: [{ rolId: rolAdmin.id }],
      },
    },
  });

  // Tipos de activo
  const tipoArbol = await prisma.tipoActivo.upsert({
    where: { nombre: 'Árbol' },
    update: {},
    create: {
      nombre: 'Árbol',
      descripcion: 'Árbol urbano',
    },
  });

  // Activos
  await prisma.activo.upsert({
    where: { codigo: 'ARB-001' },
    update: {},
    create: {
      municipioId: municipio.id,
      codigo: 'ARB-001',
      nombre: 'Árbol Plaza Central',
      tipoActivoId: tipoArbol.id,
      lat: -27.4606,
      lng: -58.8341,
      areaResponsableId: areaPoda.id,
    },
  });

  // Riesgos
  // await prisma.riesgo.upsert({
  //   where: { codigo: 'CAIDA_RAMAS' },
  //   update: {},
  //   create: {
  //     codigo: 'CAIDA_RAMAS',
  //     nombre: 'Caída de ramas',
  //     descripcion: 'Riesgo de caída de ramas en árboles',
  //     severidadBase: 4,
  //     probabilidadBase: 3,
  //     requiereAccionInmediata: true,
  //     slaSugeridoHoras: 24,
  //     areaId: areaPoda.id,
  //     tipoActivoId: tipoArbol.id,
  //   },
  // });

  // Incidentes de ejemplo en Corrientes
  const incidentesDemo = [
    { tipo: 'Pozo en calzada',   descripcion: 'Pozo profundo en calzada',          lat: -27.4606, lng: -58.8341, prioridad: 'alta',   estado: 'abierto',    area: areaPoda.id,       direccion: 'San Juan 1200' },
    { tipo: 'Luminaria apagada', descripcion: 'Luminaria sin funcionar de noche',   lat: -27.4720, lng: -58.8420, prioridad: 'media',  estado: 'en_proceso', area: areaLuminaria.id,  direccion: 'Av. Costanera 500' },
    { tipo: 'Árbol caído',       descripcion: 'Árbol caído sobre vereda',           lat: -27.4650, lng: -58.8280, prioridad: 'critica', estado: 'abierto',   area: areaPoda.id,       direccion: 'Pellegrini 800' },
    { tipo: 'Basura acumulada',  descripcion: 'Acumulación de residuos en esquina', lat: -27.4580, lng: -58.8390, prioridad: 'baja',   estado: 'resuelto',   area: areaPoda.id,       direccion: 'Mendoza y Córdoba' },
    { tipo: 'Luminaria apagada', descripcion: 'Poste de luz sin funcionar',         lat: -27.4810, lng: -58.8500, prioridad: 'media',  estado: 'abierto',    area: areaLuminaria.id,  direccion: 'Ruta 12 km 3' },
    { tipo: 'Pozo en calzada',   descripcion: 'Bache peligroso en intersección',    lat: -27.4530, lng: -58.8210, prioridad: 'alta',   estado: 'en_proceso', area: areaPoda.id,       direccion: 'Entre Ríos 450' },
    { tipo: 'Árbol peligroso',   descripcion: 'Árbol con ramas a punto de caer',   lat: -27.4690, lng: -58.8460, prioridad: 'alta',   estado: 'abierto',    area: areaPoda.id,       direccion: 'Junín 300' },
    { tipo: 'Inundación',        descripcion: 'Anegamiento por lluvia intensa',     lat: -27.4760, lng: -58.8350, prioridad: 'critica', estado: 'abierto',   area: areaLuminaria.id,  direccion: 'Av. 3 de Abril 1000' },
  ];

  for (const inc of incidentesDemo) {
    const exists = await prisma.incidente.findFirst({ where: { tipo: inc.tipo, direccion: inc.direccion } });
    if (!exists) {
      await prisma.incidente.create({
        data: {
          municipioId: municipio.id,
          tipo: inc.tipo,
          descripcion: inc.descripcion,
          lat: inc.lat,
          lng: inc.lng,
          prioridad: inc.prioridad as any,
          estado: inc.estado as any,
          areaId: inc.area,
          direccion: inc.direccion,
          reportadoPor: userAdmin.id,
        },
      });
    }
  }

  console.log('Seed data inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });