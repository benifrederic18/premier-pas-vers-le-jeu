import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { inscriptionId } = await req.json();

    if (!inscriptionId) {
      return NextResponse.json({ error: 'ID inscription manquant.' }, { status: 400 });
    }

    const inscription = await prisma.inscription.findUnique({ where: { id: inscriptionId } });
    if (!inscription) {
      return NextResponse.json({ error: 'Inscription introuvable.' }, { status: 404 });
    }

    if (inscription.statut === 'PAYE') {
      return NextResponse.json({ error: 'Cette inscription est déjà payée.' }, { status: 400 });
    }

    // FedaPay dynamic import to avoid SSR issues
    const { FedaPay, Transaction } = await import('fedapay');
    FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY!);
    FedaPay.setEnvironment(process.env.FEDAPAY_ENVIRONMENT === 'live' ? 'live' : 'sandbox');

    const params = await prisma.parametresSite.findFirst();
    const montant = params?.tarifFormation ?? 30000;

    const transaction = await Transaction.create({
      description: `Inscription - PREMIER PAS VERS LE JEU - ${inscription.nom} ${inscription.prenoms}`,
      amount: montant,
      currency: { iso: 'XOF' },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paiements/callback`,
      customer: {
        firstname: inscription.prenoms,
        lastname: inscription.nom,
        email: inscription.email,
        phone_number: { number: inscription.telephone, country: 'bj' },
      },
      custom_metadata: { inscription_id: inscription.id },
    } as any);

    const token = await (transaction as any).generateToken();

    await prisma.inscription.update({
      where: { id: inscription.id },
      data: {
        fedapayTransactionId: String(transaction.id),
        statut: 'PAIEMENT_EN_COURS',
      },
    });

    return NextResponse.json({ checkoutUrl: token.url });
  } catch (error: any) {
    console.error('Erreur création paiement:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du paiement.' }, { status: 500 });
  }
}