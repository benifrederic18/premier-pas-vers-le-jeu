import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const [
    total,
    payes,
    enAttente,
    echecs,
    revenus,
    parJour,
    parStatut,
    parSource,
  ] = await Promise.all([
    prisma.inscription.count(),
    prisma.inscription.count({ where: { statut: 'PAYE' } }),
    prisma.inscription.count({ where: { statut: 'EN_ATTENTE_PAIEMENT' } }),
    prisma.inscription.count({ where: { statut: 'ECHEC_PAIEMENT' } }),
    prisma.inscription.aggregate({ _sum: { montantPaye: true }, where: { statut: 'PAYE' } }),
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(date_inscription) as date, COUNT(*) as count
      FROM "Inscription"
      WHERE date_inscription >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(date_inscription)
      ORDER BY date ASC
    `,
    prisma.inscription.groupBy({ by: ['statut'], _count: { statut: true } }),
    prisma.inscription.groupBy({ by: ['sourceUtm'], _count: { sourceUtm: true } }),
  ]);

  return NextResponse.json({
    total,
    payes,
    enAttente,
    echecs,
    revenus: revenus._sum.montantPaye || 0,
    tauxConversion: total > 0 ? Math.round((payes / total) * 100) : 0,
    parJour: parJour.map((d) => ({ date: d.date, count: Number(d.count) })),
    parStatut,
    parSource,
  });
}