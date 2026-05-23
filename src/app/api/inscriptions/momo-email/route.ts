import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendMomoInstructions } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { inscriptionId, montant } = await req.json();

    const inscription = await prisma.inscription.findUnique({ where: { id: inscriptionId } });
    if (!inscription) return NextResponse.json({ error: 'Inscription introuvable.' }, { status: 404 });

    const params = await prisma.parametresSite.findFirst();
    if (!params?.momoActif || !params.momoNumero) {
      return NextResponse.json({ error: 'MoMo non configuré.' }, { status: 400 });
    }

    await sendMomoInstructions({
      prenoms: inscription.prenoms,
      nom: inscription.nom,
      email: inscription.email,
      montant: montant || 30000,
      momoNumero: params.momoNumero,
      momoNom: params.momoNom || '',
      momoWhatsapp: params.momoWhatsapp || '',
      inscriptionId: inscription.id,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur envoi email.' }, { status: 500 });
  }
}
