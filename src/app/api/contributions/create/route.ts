import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Prix d'un vote
const PRIX_VOTE = 500;

export async function POST(req: NextRequest) {
  try {
    const { slug, type, montant, nombreVotes, donateur, emailDonateur, message } = await req.json();

    const campagne = await prisma.campagneSoutien.findUnique({ where: { slug } });
    if (!campagne || !campagne.actif) {
      return NextResponse.json({ error: 'Campagne introuvable.' }, { status: 404 });
    }

    let montantFinal: number;
    let votesCount: number | null = null;

    if (type === 'VOTE') {
      const votes = parseInt(nombreVotes) || 1;
      montantFinal = votes * PRIX_VOTE;
      votesCount = votes;
    } else {
      montantFinal = parseFloat(montant);
      if (!montantFinal || montantFinal < 100) {
        return NextResponse.json({ error: 'Montant invalide (minimum 100 FCFA).' }, { status: 400 });
      }
    }

    const { FedaPay, Transaction } = await import('fedapay');
    FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY!);
    FedaPay.setEnvironment(process.env.FEDAPAY_ENVIRONMENT === 'live' ? 'live' : 'sandbox');

    const inscription = await prisma.inscription.findUnique({
      where: { id: campagne.inscriptionId },
      select: { nom: true, prenoms: true },
    });

    const labelType = type === 'VOTE' ? `${votesCount} vote(s)` : `Soutien ${montantFinal} FCFA`;
    const transaction = await Transaction.create({
      description: `Soutien ${inscription?.prenoms} ${inscription?.nom} — ${labelType}`,
      amount: montantFinal,
      currency: { iso: 'XOF' },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/contributions/callback`,
      customer: {
        firstname: donateur || 'Anonyme',
        lastname: '',
        email: emailDonateur || 'noreply@soutien.com',
      },
      custom_metadata: {
        campagne_id: campagne.id,
        type,
        nombre_votes: votesCount,
        donateur: donateur || null,
        message: message || null,
      },
    } as any);

    const token = await (transaction as any).generateToken();

    await prisma.contribution.create({
      data: {
        campagneId: campagne.id,
        type,
        montant: montantFinal,
        nombreVotes: votesCount,
        donateur: donateur || null,
        emailDonateur: emailDonateur || null,
        message: message || null,
        fedapayTransactionId: String(transaction.id),
        statut: 'EN_ATTENTE',
      },
    });

    return NextResponse.json({ checkoutUrl: token.url });
  } catch (error: any) {
    console.error('Erreur contribution:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du paiement.' }, { status: 500 });
  }
}
