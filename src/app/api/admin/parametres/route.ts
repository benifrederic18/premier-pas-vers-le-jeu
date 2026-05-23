import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const params = await prisma.parametresSite.findFirst();
  return NextResponse.json(params);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const existing = await prisma.parametresSite.findFirst();

  const data: any = {
    formationActive: Boolean(body.formationActive),
    messageInscriptionFermee: body.messageInscriptionFermee || null,
    placesDisponibles: parseInt(body.placesDisponibles),
    tarifFormation: parseFloat(body.tarifFormation),
    tarifTranche: parseFloat(body.tarifTranche || 15000),
    dateDebut: new Date(body.dateDebut),
    dateFin: new Date(body.dateFin),
    delaiRelanceMinutes: parseInt(body.delaiRelanceMinutes),
    delaiRelanceTranche2Jours: parseInt(body.delaiRelanceTranche2Jours || 7),
    lienWhatsapp: body.lienWhatsapp || null,
    facebookUrl: body.facebookUrl || null,
    instagramUrl: body.instagramUrl || null,
    youtubeUrl: body.youtubeUrl || null,
    tiktokUrl: body.tiktokUrl || null,
    emailGmail: body.emailGmail || null,
    momoNumero: body.momoNumero || null,
    momoNom: body.momoNom || null,
    momoWhatsapp: body.momoWhatsapp || null,
    momoActif: Boolean(body.momoActif),
  };

  const params = existing
    ? await prisma.parametresSite.update({ where: { id: existing.id }, data })
    : await prisma.parametresSite.create({ data });

  return NextResponse.json(params);
}
