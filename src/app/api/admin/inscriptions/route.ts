import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { searchParams } = req.nextUrl;
  const statut = searchParams.get('statut');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const where: any = {};
  if (statut && statut !== 'TOUS') where.statut = statut;
  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenoms: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { telephone: { contains: search } },
    ];
  }

  const [inscriptions, total] = await Promise.all([
    prisma.inscription.findMany({
      where,
      orderBy: { dateInscription: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        nom: true,
        prenoms: true,
        telephone: true,
        email: true,
        age: true,
        professionnel: true,
        dejaForme: true,
        statut: true,
        montantPaye: true,
        transactionId: true,
        dateInscription: true,
        datePaiement: true,
        sourceUtm: true,
        motivation: true,
        photoBase64: false, // Exclure la photo de la liste pour les performances
      },
    }),
    prisma.inscription.count({ where }),
  ]);

  return NextResponse.json({ inscriptions, total, pages: Math.ceil(total / limit) });
}