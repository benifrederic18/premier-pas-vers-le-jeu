import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  const inscription = await prisma.inscription.findUnique({ where: { id } });
  if (!inscription) return new NextResponse('Introuvable', { status: 404 });

  return NextResponse.json(inscription);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const allowed = ['statut', 'nom', 'prenoms', 'telephone', 'email'];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const inscription = await prisma.inscription.update({ where: { id }, data });
  return NextResponse.json(inscription);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id } = await params;
  await prisma.inscription.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}