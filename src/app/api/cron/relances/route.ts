import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { envoyerEmail, templateRelance } from '@/lib/email';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const params = await prisma.parametresSite.findFirst();
  const delaiMinutes = params?.delaiRelanceMinutes ?? 10;
  const dateLimit = new Date(Date.now() - delaiMinutes * 60 * 1000);

  const inscriptionsARelancer = await prisma.inscription.findMany({
    where: {
      statut: 'EN_ATTENTE_PAIEMENT',
      emailRelanceEnvoye: false,
      dateInscription: { lte: dateLimit },
    },
  });

  let envoyes = 0;

  for (const inscription of inscriptionsARelancer) {
    try {
      // Vérifier si le paiement a été finalisé entre temps
      const actuel = await prisma.inscription.findUnique({ where: { id: inscription.id } });
      if (!actuel || actuel.statut === 'PAYE') continue;

      // Générer nouveau lien de paiement FedaPay
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/paiements/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscriptionId: inscription.id }),
      });

      let lienPaiement = `${process.env.NEXT_PUBLIC_BASE_URL}/#inscription`;
      if (res.ok) {
        const data = await res.json();
        lienPaiement = data.checkoutUrl || lienPaiement;
      }

      await envoyerEmail({
        destinataire: inscription.email,
        nom: `${inscription.prenoms} ${inscription.nom}`,
        sujet: '⏰ Finalisez votre inscription - Places limitées',
        htmlContent: templateRelance({ prenoms: inscription.prenoms, lienPaiement }),
        typeEmail: 'RELANCE_PAIEMENT',
        inscriptionId: inscription.id,
      });

      await prisma.inscription.update({
        where: { id: inscription.id },
        data: {
          emailRelanceEnvoye: true,
          dateRelance: new Date(),
          nombreRelances: { increment: 1 },
        },
      });

      envoyes++;
    } catch (error) {
      console.error(`Erreur relance ${inscription.id}:`, error);
    }
  }

  return NextResponse.json({ message: `${envoyes} relances envoyées` });
}