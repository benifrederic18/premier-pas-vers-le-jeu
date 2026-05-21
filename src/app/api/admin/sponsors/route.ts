import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const sponsors = await prisma.sponsor.findMany({
    orderBy: [{ ordre: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(sponsors);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const sponsor = await prisma.sponsor.create({
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
  return NextResponse.json(sponsor, { status: 201 });
}
