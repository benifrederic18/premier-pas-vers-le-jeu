import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  envoyerEmail,
  templateConfirmationParticipant,
  templateNotificationAdmin,
  templateTranche1Confirmee,
} from '@/lib/email';
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
      const montantRecu = event.entity.amount as number;

      const inscription = await prisma.inscription.findFirst({
        where: {
          OR: [
            { fedapayTransactionId },
            { fedapayTranche1Id: fedapayTransactionId },
            { fedapayTranche2Id: fedapayTransactionId },
          ],
        },
      });

      if (!inscription) {
        return new NextResponse('Inscription introuvable', { status: 404 });
      }

      if (inscription.statut === 'PAYE') {
        return new NextResponse('OK', { status: 200 });
      }

      const params = await prisma.parametresSite.findFirst();
      const adminEmail = process.env.EMAIL_ADMIN || process.env.GMAIL_USER;

      // Paiement complet ou 2ème tranche
      const isDeuxiemeTranche =
        inscription.statut === 'TRANCHE1_PAYEE' &&
        fedapayTransactionId === inscription.fedapayTranche2Id;

      const isPremierePaiement = !inscription.tranche1Payee;

      if (inscription.modePaiement === 'TRANCHE' && isPremierePaiement) {
        // 1ère tranche
        const updated = await prisma.inscription.update({
          where: { id: inscription.id },
          data: {
            statut: 'TRANCHE1_PAYEE',
            tranche1Payee: true,
            tranche1TransactionId: event.entity.reference || fedapayTransactionId,
            dateTranche1: new Date(),
            montantPaye: montantRecu,
            fedapayTranche1Id: fedapayTransactionId,
          },
        });

        // Email confirmation tranche 1
        await Promise.allSettled([
          envoyerEmail({
            destinataire: updated.email,
            nom: `${updated.prenoms} ${updated.nom}`,
            sujet: '✅ 1ère tranche reçue — Premier Pas Vers Le Jeu',
            htmlContent: templateTranche1Confirmee({
              prenoms: updated.prenoms,
              nom: updated.nom,
              email: updated.email,
              telephone: updated.telephone,
              transactionId: updated.tranche1TransactionId!,
              datePaiement: updated.dateTranche1!,
              modeParticipation: updated.modeParticipation,
              delaiJours: params?.delaiRelanceTranche2Jours ?? 7,
            }),
            typeEmail: 'CONFIRMATION_PAIEMENT',
            inscriptionId: updated.id,
          }),
          adminEmail
            ? envoyerEmail({
                destinataire: adminEmail,
                nom: 'Admin',
                sujet: `💳 Tranche 1 reçue — ${updated.nom} ${updated.prenoms}`,
                htmlContent: templateNotificationAdmin({
                  nom: updated.nom,
                  prenoms: updated.prenoms,
                  email: updated.email,
                  telephone: updated.telephone,
                  age: updated.age,
                  professionnel: updated.professionnel,
                  dejaForme: updated.dejaForme,
                  transactionId: updated.tranche1TransactionId!,
                  datePaiement: updated.dateTranche1!,
                  id: updated.id,
                  modePaiement: 'TRANCHE',
                  modeParticipation: updated.modeParticipation,
                  typeNotif: '1ère tranche de paiement reçue',
                }),
                typeEmail: 'NOTIFICATION_ADMIN',
                inscriptionId: updated.id,
              })
            : Promise.resolve(),
        ]);
      } else {
        // Paiement complet OU 2ème tranche
        const isSecondTranche = inscription.modePaiement === 'TRANCHE' && inscription.tranche1Payee;
        const totalPaye = isSecondTranche
          ? (inscription.montantPaye || 0) + montantRecu
          : montantRecu;

        const updated = await prisma.inscription.update({
          where: { id: inscription.id },
          data: {
            statut: 'PAYE',
            montantPaye: totalPaye,
            transactionId: event.entity.reference || fedapayTransactionId,
            datePaiement: new Date(),
            emailConfirmationEnvoye: true,
            ...(isSecondTranche
              ? {
                  tranche2Payee: true,
                  tranche2TransactionId: event.entity.reference || fedapayTransactionId,
                  dateTranche2: new Date(),
                  fedapayTranche2Id: fedapayTransactionId,
                }
              : {}),
          },
        });

        // Envoyer lien WhatsApp si disponible
        const lienWhatsapp = params?.lienWhatsapp || null;

        await Promise.allSettled([
          envoyerEmail({
            destinataire: updated.email,
            nom: `${updated.prenoms} ${updated.nom}`,
            sujet: '🎬 Inscription confirmée — Premier Pas Vers Le Jeu',
            htmlContent: templateConfirmationParticipant({
              prenoms: updated.prenoms,
              nom: updated.nom,
              email: updated.email,
              telephone: updated.telephone,
              transactionId: updated.transactionId!,
              datePaiement: updated.datePaiement!,
              modePaiement: updated.modePaiement,
              modeParticipation: updated.modeParticipation,
              lienWhatsapp,
            }),
            typeEmail: 'CONFIRMATION_PAIEMENT',
            inscriptionId: updated.id,
          }),
          adminEmail
            ? envoyerEmail({
                destinataire: adminEmail,
                nom: 'Admin',
                sujet: `🔔 Inscription payée — ${updated.nom} ${updated.prenoms}`,
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
                  modePaiement: updated.modePaiement,
                  modeParticipation: updated.modeParticipation,
                }),
                typeEmail: 'NOTIFICATION_ADMIN',
                inscriptionId: updated.id,
              })
            : Promise.resolve(),
        ]);

        // Marquer lien WhatsApp envoyé
        if (lienWhatsapp) {
          await prisma.inscription.update({
            where: { id: updated.id },
            data: { lienWhatsappEnvoye: true },
          });
        }
      }
    }

    if (event.name === 'transaction.declined') {
      await prisma.inscription.updateMany({
        where: {
          OR: [
            { fedapayTransactionId: String(event.entity.id) },
            { fedapayTranche1Id: String(event.entity.id) },
            { fedapayTranche2Id: String(event.entity.id) },
          ],
        },
        data: { statut: 'ECHEC_PAIEMENT' },
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Erreur webhook FedaPay:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
