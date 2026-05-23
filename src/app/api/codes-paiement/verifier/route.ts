import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code) return NextResponse.json({ error: 'Code requis.' }, { status: 400 });

  const cp = await prisma.codePaiement.findUnique({ where: { code: code.toUpperCase() } });

  if (!cp) return NextResponse.json({ error: 'Code invalide. Vérifiez et réessayez.' }, { status: 404 });
  if (cp.utilise) return NextResponse.json({ error: 'Ce code a déjà été utilisé.' }, { status: 400 });

  return NextResponse.json({
    valid: true,
    email: cp.email,
    nomApprenant: cp.nomApprenant,
    montant: cp.montant,
  });
}
