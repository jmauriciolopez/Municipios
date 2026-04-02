import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    where: { nombre: 'Administrador' },
    update: {},
    create: {
      nombre: 'Administrador',
      descripcion: 'Usuario con acceso completo',
    },
  });

  const rolOperario = await prisma.rol.upsert({
    where: { nombre: 'Operario' },
    update: {},
    create: {
      nombre: 'Operario',
      descripcion: 'Usuario de campo',
    },
  });

  // Usuarios
  const passwordHash = await import('bcryptjs').then((bcrypt) => bcrypt.hash('secret', 10));

  const userAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@municipio.com' },
    update: {},
    create: {
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
      lat: -34.6037,
      lng: -58.3816,
      areaResponsableId: areaPoda.id,
    },
  });

  // Riesgos
  await prisma.riesgo.upsert({
    where: { nombre: 'Caída de ramas' },
    update: {},
    create: {
      nombre: 'Caída de ramas',
      descripcion: 'Riesgo de caída de ramas en árboles',
      nivel: 3,
      areaId: areaPoda.id,
    },
  });

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