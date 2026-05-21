import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const currentAdmin = await prisma.admin.findUnique({ where: { email: (session.user as any).email } });
  if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
    return new NextResponse('Droits insuffisants', { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: any = {
    nom: body.nom,
    email: body.email,
    role: body.role,
    droits: body.droits || null,
    actif: body.actif !== false,
  };

  if (body.password) {
    data.passwordHash = await bcrypt.hash(body.password, 12);
  }

  const admin = await prisma.admin.update({
    where: { id },
    data,
    select: { id: true, email: true, nom: true, role: true, droits: true, actif: true, createdAt: true },
  });

  return NextResponse.json(admin);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const currentAdmin = await prisma.admin.findUnique({ where: { email: (session.user as any).email } });
  if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
    return new NextResponse('Droits insuffisants', { status: 403 });
  }

  const { id } = await params;

  if (currentAdmin.id === id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas vous supprimer vous-même.' }, { status: 400 });
  }

  await prisma.admin.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
