import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const [admins, currentAdmin] = await Promise.all([
    prisma.admin.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, nom: true, role: true, droits: true, actif: true, createdAt: true },
    }),
    prisma.admin.findUnique({
      where: { email: (session.user as any).email },
      select: { role: true },
    }),
  ]);

  return NextResponse.json({ admins, currentRole: currentAdmin?.role ?? 'ADMIN' });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const currentAdmin = await prisma.admin.findUnique({ where: { email: (session.user as any).email } });
  if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
    return new NextResponse('Droits insuffisants', { status: 403 });
  }

  const body = await req.json();
  const { email, nom, password, role, droits } = body;

  if (!email || !nom || !password) {
    return NextResponse.json({ error: 'Email, nom et mot de passe requis.' }, { status: 400 });
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({
    data: { email, nom, passwordHash, role: role || 'ADMIN', droits: droits || null, actif: true },
    select: { id: true, email: true, nom: true, role: true, droits: true, actif: true, createdAt: true },
  });

  return NextResponse.json(admin, { status: 201 });
}
