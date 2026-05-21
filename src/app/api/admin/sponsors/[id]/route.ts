import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const sponsor = await prisma.sponsor.update({
    where: { id },
    data: {
      nom: body.nom,
      logoUrl: body.logoUrl,
      siteWeb: body.siteWeb || null,
      description: body.description || null,
      type: body.type || 'PARTENAIRE',
      ordre: parseInt(body.ordre) || 0,
      actif: body.actif !== false,
    },
  });
  return NextResponse.json(sponsor);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  await prisma.sponsor.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
