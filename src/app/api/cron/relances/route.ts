import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { envoyerEmail, templateRelance, templateRelanceTranche2 } from '@/lib/email';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const params = await prisma.parametresSite.findFirst();
  const delaiMinutes = params?.delaiRelanceMinutes ?? 10;
  const delaiTranche2Jours = params?.delaiRelanceTranche2Jours ?? 7;

  const dateLimit = new Date(Date.now() - delaiMinutes * 60 * 1000);
  const dateLimitTranche2 = new Date(Date.now() - delaiTranche2Jours * 24 * 60 * 60 * 1000);

  // Relances paiement initial
  const inscriptionsARelancer = await prisma.inscription.findMany({
    where: {
      statut: 'EN_ATTENTE_PAIEMENT',
      emailRelanceEnvoye: false,
      dateInscription: { lte: dateLimit },
    },
  });

  // Relances 2ème tranche
  const inscriptionsTranche2 = await prisma.inscription.findMany({
    where: {
      statut: 'TRANCHE1_PAYEE',
      emailRelanceTranche2: false,
      dateTranche1: { lte: dateLimitTranche2 },
    },
  });

  let envoyes = 0;
  let envoyes2 = 0;

  // Relances paiement initial
  for (const inscription of inscriptionsARelancer) {
    try {
      const actuel = await prisma.inscription.findUnique({ where: { id: inscription.id } });
      if (!actuel || actuel.statut === 'PAYE') continue;

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
        sujet: '⏰ Finalisez votre inscription — Places limitées',
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

  // Relances 2ème tranche
  for (const inscription of inscriptionsTranche2) {
    try {
      const actuel = await prisma.inscription.findUnique({ where: { id: inscription.id } });
      if (!actuel || actuel.statut === 'PAYE') continue;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/paiements/tranche2`, {
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
        sujet: '💳 Rappel : 2ème tranche de paiement — Premier Pas Vers Le Jeu',
        htmlContent: templateRelanceTranche2({ prenoms: inscription.prenoms, lienPaiement }),
        typeEmail: 'RELANCE_TRANCHE2',
        inscriptionId: inscription.id,
      });

      await prisma.inscription.update({
        where: { id: inscription.id },
        data: {
          emailRelanceTranche2: true,
          dateRelanceTranche2: new Date(),
          nombreRelancesTranche2: { increment: 1 },
        },
      });

      envoyes2++;
    } catch (error) {
      console.error(`Erreur relance tranche2 ${inscription.id}:`, error);
    }
  }

  return NextResponse.json({
    message: `${envoyes} relances initiales + ${envoyes2} relances 2ème tranche envoyées`,
  });
}
