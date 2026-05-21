import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const url = new URL(req.url);
  const traite = url.searchParams.get('traite');

  const demandes = await prisma.demandePartenariat.findMany({
    where: traite !== null ? { traite: traite === 'true' } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(demandes);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const { id, traite } = body;

  const demande = await prisma.demandePartenariat.update({
    where: { id },
    data: { traite },
  });
  return NextResponse.json(demande);
}
