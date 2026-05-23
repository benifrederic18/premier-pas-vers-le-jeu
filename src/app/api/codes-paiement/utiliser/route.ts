import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { envoyerEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, nom, prenoms, telephone, email, age, dejaForme, professionnel, motivation, modeParticipation } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code requis.' }, { status: 400 });
    }

    const cp = await prisma.codePaiement.findUnique({ where: { code: code.toUpperCase() } });

    if (!cp) {
      return NextResponse.json({ error: 'Code invalide. Vérifiez le code et réessayez.' }, { status: 404 });
    }

    if (cp.utilise) {
      return NextResponse.json({ error: 'Ce code a déjà été utilisé.' }, { status: 400 });
    }

    // Create the inscription as fully paid
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
        emailConfirmationEnvoye: false,
      },
    });

    // Mark code as used
    await prisma.codePaiement.update({
      where: { code: cp.code },
      data: { utilise: true, dateUtilise: new Date(), inscriptionId: inscription.id },
    });

    const params = await prisma.parametresSite.findFirst();

    // Send confirmation email to learner
    try {
      await envoyerEmail({
        destinataire: inscription.email,
        nom: `${inscription.prenoms} ${inscription.nom}`,
        sujet: 'Confirmation d\'inscription — Premier Pas Vers Le Jeu',
        htmlContent: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px;">
            <h1 style="color:#f97316;font-size:24px;margin-bottom:8px;">🎭 Inscription confirmée !</h1>
            <p style="color:#d1d5db;">Bonjour <strong>${inscription.prenoms}</strong>,</p>
            <p style="color:#d1d5db;">Votre inscription à la formation <strong>Premier Pas Vers Le Jeu</strong> a été validée avec succès.</p>
            <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #f97316/20;">
              <p style="color:#f97316;font-weight:bold;margin:0 0 8px;">Détails de votre inscription</p>
              <p style="color:#9ca3af;margin:4px 0;">Nom : <span style="color:#fff;">${inscription.prenoms} ${inscription.nom}</span></p>
              <p style="color:#9ca3af;margin:4px 0;">Email : <span style="color:#fff;">${inscription.email}</span></p>
              <p style="color:#9ca3af;margin:4px 0;">Montant payé : <span style="color:#fff;">${cp.montant.toLocaleString('fr-FR')} FCFA</span></p>
              <p style="color:#9ca3af;margin:4px 0;">Mode : <span style="color:#fff;">Paiement direct (code validé)</span></p>
            </div>
            ${params?.lienWhatsapp ? `<p style="color:#d1d5db;">Rejoignez notre groupe WhatsApp : <a href="${params.lienWhatsapp}" style="color:#f97316;">${params.lienWhatsapp}</a></p>` : ''}
            <p style="color:#6b7280;font-size:13px;margin-top:32px;">Premier Pas Vers Le Jeu</p>
          </div>
        `,
        typeEmail: 'PAIEMENT_CODE',
        inscriptionId: inscription.id,
      });
    } catch {}

    // Notify admin
    const emailAdmin = process.env.EMAIL_ADMIN || params?.emailGmail;
    if (emailAdmin) {
      try {
        await envoyerEmail({
          destinataire: emailAdmin,
          nom: 'Admin',
          sujet: `[Code validé] ${inscription.prenoms} ${inscription.nom} — ${cp.montant.toLocaleString('fr-FR')} FCFA`,
          htmlContent: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2>✅ Code de paiement utilisé</h2>
              <p><strong>Apprenant :</strong> ${inscription.prenoms} ${inscription.nom}</p>
              <p><strong>Email :</strong> ${inscription.email}</p>
              <p><strong>Montant :</strong> ${cp.montant.toLocaleString('fr-FR')} FCFA</p>
              <p><strong>Code :</strong> ${cp.code}</p>
              <p><strong>Code généré par :</strong> ${cp.createdBy}</p>
              <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          `,
          typeEmail: 'NOTIFICATION_ADMIN',
          inscriptionId: inscription.id,
        });
      } catch {}
    }

    return NextResponse.json({ success: true, inscriptionId: inscription.id });
  } catch (err: any) {
    console.error('Erreur code paiement:', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
