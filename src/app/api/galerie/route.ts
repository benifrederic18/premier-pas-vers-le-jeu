import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const medias = await prisma.mediaGalerie.findMany({
    where: { actif: true },
    orderBy: [{ ordre: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, type: true, url: true, miniature: true, titre: true, edition: true },
  });
  return NextResponse.json(medias);
}
