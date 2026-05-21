import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const media = await prisma.mediaGalerie.update({
    where: { id },
    data: {
      type: body.type,
      url: body.url,
      miniature: body.miniature || null,
      titre: body.titre,
      edition: body.edition || null,
      ordre: parseInt(body.ordre) || 0,
      actif: body.actif !== false,
    },
  });
  return NextResponse.json(media);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  await prisma.mediaGalerie.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
