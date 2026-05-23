import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Public endpoint — returns only non-sensitive config needed by the frontend
export async function GET() {
  const params = await prisma.parametresSite.findFirst({
    select: {
      momoNumero: true,
      momoNom: true,
      momoWhatsapp: true,
      momoActif: true,
      formationActive: true,
      messageInscriptionFermee: true,
    },
  });
  return NextResponse.json(params ?? {});
}
