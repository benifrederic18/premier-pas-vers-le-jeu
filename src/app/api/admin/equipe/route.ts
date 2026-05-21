import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const membres = await prisma.membreEquipe.findMany({
    orderBy: [{ type: 'asc' }, { ordre: 'asc' }],
  });
  return NextResponse.json(membres);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const membre = await prisma.membreEquipe.create({
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
  return NextResponse.json(membre, { status: 201 });
}
