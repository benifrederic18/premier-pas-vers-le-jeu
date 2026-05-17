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

  const data = {
    formationActive: Boolean(body.formationActive),
    placesDisponibles: parseInt(body.placesDisponibles),
    tarifFormation: parseFloat(body.tarifFormation),
    dateDebut: new Date(body.dateDebut),
    dateFin: new Date(body.dateFin),
    delaiRelanceMinutes: parseInt(body.delaiRelanceMinutes),
  };

  const params = existing
    ? await prisma.parametresSite.update({ where: { id: existing.id }, data })
    : await prisma.parametresSite.create({ data });

  return NextResponse.json(params);
}