import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const medias = await prisma.mediaGalerie.findMany({
    orderBy: [{ ordre: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(medias);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const media = await prisma.mediaGalerie.create({
    data: {
      type: body.type || 'PHOTO',
      url: body.url,
      miniature: body.miniature || null,
      titre: body.titre,
      edition: body.edition || null,
      ordre: parseInt(body.ordre) || 0,
      actif: body.actif !== false,
    },
  });
  return NextResponse.json(media, { status: 201 });
}
