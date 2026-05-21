import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const campagnes = await prisma.campagneSoutien.findMany({
    include: {
      inscription: { select: { nom: true, prenoms: true, email: true, photoUrl: true, photoBase64: true, photoMimeType: true } },
      contributions: { where: { statut: 'PAYE' }, orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(campagnes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const { inscriptionId, titre, description, objectif, actif } = body;

  const inscription = await prisma.inscription.findUnique({ where: { id: inscriptionId } });
  if (!inscription) return NextResponse.json({ error: 'Inscription introuvable.' }, { status: 404 });

  const slug = `${inscription.prenoms}-${inscription.nom}-${Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  const existing = await prisma.campagneSoutien.findUnique({ where: { inscriptionId } });
  if (existing) {
    const updated = await prisma.campagneSoutien.update({
      where: { inscriptionId },
      data: { titre, description, objectif: objectif ? parseFloat(objectif) : null, actif: actif !== false },
    });
    return NextResponse.json(updated);
  }

  const campagne = await prisma.campagneSoutien.create({
    data: {
      inscriptionId,
      slug,
      titre: titre || `Soutenez ${inscription.prenoms} ${inscription.nom}`,
      description,
      objectif: objectif ? parseFloat(objectif) : null,
      actif: actif !== false,
    },
  });

  return NextResponse.json(campagne, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const { id, actif, titre, description, objectif } = body;

  const campagne = await prisma.campagneSoutien.update({
    where: { id },
    data: {
      actif,
      titre,
      description,
      objectif: objectif ? parseFloat(objectif) : null,
    },
  });

  return NextResponse.json(campagne);
}
