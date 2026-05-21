import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const membre = await prisma.membreEquipe.update({
    where: { id },
    data: {
      nom: body.nom,
      role: body.role,
      bio: body.bio || null,
      photoUrl: body.photoUrl || null,
      type: body.type || 'EQUIPE',
      ordre: parseInt(body.ordre) || 0,
      actif: body.actif !== false,
      reseaux: body.reseaux || null,
    },
  });
  return NextResponse.json(membre);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  await prisma.membreEquipe.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
