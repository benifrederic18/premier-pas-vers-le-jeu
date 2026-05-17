import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { envoyerEmail, templateConfirmationParticipant, templateNotificationAdmin } from '@/lib/email';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-fedapay-signature') || '';

    if (process.env.FEDAPAY_WEBHOOK_SECRET && signature) {
      if (!verifySignature(payload, signature, process.env.FEDAPAY_WEBHOOK_SECRET)) {
        return new NextResponse('Signature invalide', { status: 401 });
      }
    }

    const event = JSON.parse(payload);

    if (event.name === 'transaction.approved') {
      const fedapayTransactionId = String(event.entity.id);

      const inscription = await prisma.inscription.findFirst({
        where: { fedapayTransactionId },
      });

      if (!inscription) {
        return new NextResponse('Inscription introuvable', { status: 404 });
      }

      if (inscription.statut === 'PAYE') {
        return new NextResponse('OK', { status: 200 });
      }

      const updated = await prisma.inscription.update({
        where: { id: inscription.id },
        data: {
          statut: 'PAYE',
          montantPaye: event.entity.amount,
          transactionId: event.entity.reference || String(event.entity.id),
          datePaiement: new Date(),
          emailConfirmationEnvoye: true,
        },
      });

      await Promise.allSettled([
        envoyerEmail({
          destinataire: updated.email,
          nom: `${updated.prenoms} ${updated.nom}`,
          sujet: '🎬 Inscription confirmée - Premier Pas Vers Le Jeu',
          htmlContent: templateConfirmationParticipant({
            prenoms: updated.prenoms,
            nom: updated.nom,
            email: updated.email,
            telephone: updated.telephone,
            transactionId: updated.transactionId!,
            datePaiement: updated.datePaiement!,
          }),
          typeEmail: 'CONFIRMATION_PAIEMENT',
          inscriptionId: updated.id,
        }),
        envoyerEmail({
          destinataire: process.env.EMAIL_ADMIN!,
          nom: 'Admin',
          sujet: `🔔 Nouvelle inscription payée - ${updated.nom} ${updated.prenoms}`,
          htmlContent: templateNotificationAdmin({
            nom: updated.nom,
            prenoms: updated.prenoms,
            email: updated.email,
            telephone: updated.telephone,
            age: updated.age,
            professionnel: updated.professionnel,
            dejaForme: updated.dejaForme,
            transactionId: updated.transactionId!,
            datePaiement: updated.datePaiement!,
            id: updated.id,
          }),
          typeEmail: 'NOTIFICATION_ADMIN',
          inscriptionId: updated.id,
        }),
      ]);
    }

    if (event.name === 'transaction.declined') {
      await prisma.inscription.updateMany({
        where: { fedapayTransactionId: String(event.entity.id) },
        data: { statut: 'ECHEC_PAIEMENT' },
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Erreur webhook FedaPay:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}