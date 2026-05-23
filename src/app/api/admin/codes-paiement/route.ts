import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';
import { sendCodeInvitation } from '@/lib/email';

function generateCode(): string {
  return randomBytes(4).toString('hex').toUpperCase(); // ex: A3F9B2C1
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const codes = await prisma.codePaiement.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(codes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const { email, nomApprenant, montant } = body;

  if (!email || !nomApprenant || !montant) {
    return NextResponse.json({ error: 'Email, nom et montant requis.' }, { status: 400 });
  }

  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.codePaiement.findUnique({ where: { code } });
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  const cp = await prisma.codePaiement.create({
    data: {
      code,
      email,
      nomApprenant,
      montant: parseFloat(montant),
      createdBy: (session.user as any).email || 'admin',
    },
  });

  // Send invitation email to learner with pre-filled link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const lienInscription = `${baseUrl}/?code=${code}#inscription`;
  const [prenoms, ...restNom] = nomApprenant.split(' ');
  try {
    await sendCodeInvitation({
      prenoms: prenoms || nomApprenant,
      nom: restNom.join(' ') || nomApprenant,
      email,
      montant: parseFloat(montant),
      code,
      lienInscription,
    });
  } catch {}

  return NextResponse.json(cp, { status: 201 });
}
