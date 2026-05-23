import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendCodePaiementConfirmation, envoyerEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, nom, prenoms, telephone, email, age, dejaForme, professionnel, motivation, modeParticipation } = body;

    if (!code) return NextResponse.json({ error: 'Code requis.' }, { status: 400 });

    const cp = await prisma.codePaiement.findUnique({ where: { code: code.toUpperCase() } });
    if (!cp) return NextResponse.json({ error: 'Code invalide. Vérifiez le code et réessayez.' }, { status: 404 });
    if (cp.utilise) return NextResponse.json({ error: 'Ce code a déjà été utilisé.' }, { status: 400 });

    const inscription = await prisma.inscription.create({
      data: {
        nom: nom || cp.nomApprenant.split(' ').slice(1).join(' ') || cp.nomApprenant,
        prenoms: prenoms || cp.nomApprenant.split(' ')[0] || cp.nomApprenant,
        telephone: telephone || '',
        email: email || cp.email,
        age: parseInt(age) || 18,
        dejaForme: Boolean(dejaForme),
        professionnel: Boolean(professionnel),
        motivation: motivation || 'Paiement direct enregistré par admin.',
        modeParticipation: modeParticipation || 'PRESENTIEL',
        modePaiement: 'COMPLET',
        statut: 'PAYE',
        montantPaye: cp.montant,
        datePaiement: new Date(),
        emailConfirmationEnvoye: true,
      },
    });

    await prisma.codePaiement.update({
      where: { code: cp.code },
      data: { utilise: true, dateUtilise: new Date(), inscriptionId: inscription.id },
    });

    const params = await prisma.parametresSite.findFirst();

    await Promise.allSettled([
      // Confirmation to learner — uses DB template if available
      sendCodePaiementConfirmation({
        prenoms: inscription.prenoms,
        nom: inscription.nom,
        email: inscription.email,
        montant: cp.montant,
        code: cp.code,
        lienWhatsapp: params?.lienWhatsapp ?? null,
        inscriptionId: inscription.id,
      }),

      // Admin notification
      (process.env.EMAIL_ADMIN || params?.emailGmail)
        ? envoyerEmail({
            destinataire: process.env.EMAIL_ADMIN || params?.emailGmail!,
            nom: 'Admin',
            sujet: `[Code validé] ${inscription.prenoms} ${inscription.nom} — ${cp.montant.toLocaleString('fr-FR')} FCFA`,
            htmlContent: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2>✅ Code de paiement utilisé</h2>
                <p><strong>Apprenant :</strong> ${inscription.prenoms} ${inscription.nom}</p>
                <p><strong>Email :</strong> ${inscription.email}</p>
                <p><strong>Montant :</strong> ${cp.montant.toLocaleString('fr-FR')} FCFA</p>
                <p><strong>Code :</strong> <code>${cp.code}</code></p>
                <p><strong>Généré par :</strong> ${cp.createdBy}</p>
                <p><strong>Validé le :</strong> ${new Date().toLocaleString('fr-FR')}</p>
              </div>`,
            typeEmail: 'NOTIFICATION_ADMIN',
            inscriptionId: inscription.id,
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json({ success: true, inscriptionId: inscription.id });
  } catch (err: any) {
    console.error('Erreur code paiement:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
