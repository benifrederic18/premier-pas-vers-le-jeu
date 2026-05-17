import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@premierpasverslejeu.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin1234!';
  const nom = process.env.ADMIN_NOM || 'Super Admin';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await hash(password, 12);
  const admin = await prisma.admin.create({
    data: { email, nom, passwordHash, role: 'SUPER_ADMIN' },
  });

  // Créer aussi les paramètres par défaut si inexistants
  const params = await prisma.parametresSite.findFirst();
  if (!params) {
    await prisma.parametresSite.create({
      data: {
        formationActive: true,
        placesDisponibles: 50,
        tarifFormation: 30000,
        dateDebut: new Date('2025-06-24'),
        dateFin: new Date('2025-06-27'),
        delaiRelanceMinutes: 10,
      },
    });
    console.log('Default site parameters created.');
  }

  console.log(`Admin created: ${admin.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());