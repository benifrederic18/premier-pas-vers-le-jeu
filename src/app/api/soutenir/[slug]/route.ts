import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const campagne = await prisma.campagneSoutien.findUnique({
    where: { slug },
    include: {
      inscription: {
        select: {
          nom: true,
          prenoms: true,
          email: true,
          photoUrl: true,
          photoBase64: true,
          photoMimeType: true,
          modeParticipation: true,
        },
      },
      contributions: {
        where: { statut: 'PAYE' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, type: true, montant: true, nombreVotes: true, donateur: true, message: true, createdAt: true },
      },
    },
  });

  if (!campagne || !campagne.actif) {
    return NextResponse.json({ error: 'Campagne introuvable.' }, { status: 404 });
  }

  return NextResponse.json(campagne);
}
