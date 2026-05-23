import nodemailer from 'nodemailer';
import { prisma } from './db';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

interface EmailParams {
  destinataire: string;
  nom: string;
  sujet: string;
  htmlContent: string;
  typeEmail:
    | 'CONFIRMATION_PAIEMENT'
    | 'RELANCE_PAIEMENT'
    | 'EMAIL_GROUPE'
    | 'NOTIFICATION_ADMIN'
    | 'RELANCE_TRANCHE2'
    | 'LIEN_WHATSAPP'
    | 'NOTIFICATION_SPONSOR'
    | 'NOTIFICATION_ACTION'
    | 'PAIEMENT_CODE'
    | 'MOMO_INSTRUCTIONS';
  inscriptionId?: string;
}

export async function envoyerEmail({ destinataire, nom, sujet, htmlContent, typeEmail, inscriptionId }: EmailParams) {
  try {
    await transporter.sendMail({
      from: `"${process.env.NEXT_PUBLIC_SITE_NAME}" <${process.env.GMAIL_USER}>`,
      to: destinataire,
      subject: sujet,
      html: htmlContent,
    });

    await prisma.logEmail.create({
      data: { destinataire, sujet, typeEmail, statut: 'ENVOYE', inscriptionId },
    });
  } catch (error: any) {
    await prisma.logEmail.create({
      data: { destinataire, sujet, typeEmail, statut: 'ECHEC', erreur: error?.message, inscriptionId },
    });
    throw error;
  }
}

export function templateConfirmationParticipant(data: {
  prenoms: string;
  nom: string;
  email: string;
  telephone: string;
  transactionId: string;
  datePaiement: Date;
  modePaiement?: string;
  modeParticipation?: string;
  lienWhatsapp?: string | null;
}) {
  const modeLabel = data.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel';
  const paiementLabel = data.modePaiement === 'TRANCHE' ? '15 000 FCFA (1ère tranche)' : '30 000 FCFA';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #FF6B35, #F7931E); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .badge { background: #4CAF50; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
    .info-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #FF6B35; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .info-box p { margin: 6px 0; }
    .btn { background: #25D366; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; margin: 10px 0; }
    .footer { background: #0A0A0A; color: #888; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>INSCRIPTION CONFIRMÉE</h1></div>
    <div class="content">
      <p>Bonjour <strong>${data.prenoms}</strong>,</p>
      <p>Félicitations ! Votre inscription à la formation <strong>PREMIER PAS VERS LE JEU</strong> a été confirmée avec succès.</p>
      <div class="badge">PAIEMENT VALIDÉ</div>
      <div class="info-box">
        <h3>Récapitulatif</h3>
        <p><strong>Nom complet :</strong> ${data.nom} ${data.prenoms}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Téléphone :</strong> ${data.telephone}</p>
        <p><strong>Mode :</strong> ${modeLabel}</p>
        <p><strong>Montant payé :</strong> ${paiementLabel}</p>
        <p><strong>Référence :</strong> ${data.transactionId}</p>
        <p><strong>Date :</strong> ${new Date(data.datePaiement).toLocaleDateString('fr-FR')}</p>
      </div>
      <div class="info-box">
        <h3>Informations pratiques</h3>
        <p><strong>Dates :</strong> 24 au 27 Juin 2025</p>
        <p><strong>Horaires :</strong> 9h00 - 17h00</p>
        <p><strong>Lieu :</strong> Cotonou, Bénin</p>
      </div>
      ${data.lienWhatsapp ? `
      <div style="text-align:center;margin:24px 0;">
        <p style="margin-bottom:12px;font-weight:bold;">Rejoins notre groupe WhatsApp pour ne rien manquer !</p>
        <a href="${data.lienWhatsapp}" class="btn">💬 Rejoindre le groupe WhatsApp</a>
      </div>` : ''}
      <p>Pour toute question : ${process.env.GMAIL_USER}</p>
      <p>À très bientôt !</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Premier Pas Vers Le Jeu.</p>
      <p>Cet email a été envoyé à ${data.email}</p>
    </div>
  </div>
</body>
</html>`;
}

export function templateTranche1Confirmee(data: {
  prenoms: string;
  nom: string;
  email: string;
  telephone: string;
  transactionId: string;
  datePaiement: Date;
  modeParticipation?: string;
  delaiJours?: number;
}) {
  const modeLabel = data.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel';
  const delai = data.delaiJours ?? 7;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:20px; }
    .container { max-width:600px; margin:0 auto; background:white; border-radius:8px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#FF6B35,#F7931E); padding:40px; text-align:center; }
    .header h1 { color:white; margin:0; font-size:22px; }
    .content { padding:30px; }
    .badge { background:#FF6B35; color:white; padding:8px 20px; border-radius:20px; display:inline-block; font-weight:bold; margin:10px 0; }
    .info-box { background:#f9f9f9; padding:20px; border-left:4px solid #FF6B35; margin:20px 0; border-radius:0 4px 4px 0; }
    .info-box p { margin:6px 0; }
    .warning { background:#FFF3CD; border-left:4px solid #FF6B35; padding:15px; margin:20px 0; border-radius:0 4px 4px 0; }
    .footer { background:#0A0A0A; color:#888; padding:20px; text-align:center; font-size:12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>1ÈRE TRANCHE CONFIRMÉE</h1></div>
    <div class="content">
      <p>Bonjour <strong>${data.prenoms}</strong>,</p>
      <p>Votre première tranche de paiement a bien été reçue !</p>
      <div class="badge">15 000 FCFA REÇUS</div>
      <div class="info-box">
        <h3>Récapitulatif</h3>
        <p><strong>Nom :</strong> ${data.nom} ${data.prenoms}</p>
        <p><strong>Mode :</strong> ${modeLabel}</p>
        <p><strong>1ère tranche :</strong> 15 000 FCFA ✅</p>
        <p><strong>2ème tranche :</strong> 15 000 FCFA ⏳ (à régler)</p>
        <p><strong>Référence :</strong> ${data.transactionId}</p>
        <p><strong>Date :</strong> ${new Date(data.datePaiement).toLocaleDateString('fr-FR')}</p>
      </div>
      <div class="warning">
        <p><strong>Important :</strong> Vous recevrez un rappel dans ${delai} jour(s) pour régler la 2ème tranche de 15 000 FCFA et finaliser votre inscription.</p>
      </div>
      <p>Pour toute question : ${process.env.GMAIL_USER}</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Premier Pas Vers Le Jeu.</p>
    </div>
  </div>
</body>
</html>`;
}

export function templateRelanceTranche2(data: { prenoms: string; lienPaiement: string }) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>Rappel : 2ème tranche en attente</h2>
  <p>Bonjour <strong>${data.prenoms}</strong>,</p>
  <p>Votre 1ère tranche a bien été réglée. Il vous reste <strong>15 000 FCFA</strong> à payer pour finaliser votre inscription à <strong>PREMIER PAS VERS LE JEU</strong>.</p>
  <div style="background:#FFF3CD;border-left:4px solid #FF6B35;padding:15px;margin:20px 0;">
    <p style="margin:0;"><strong>Places limitées !</strong> Finalisez votre inscription dès maintenant.</p>
  </div>
  <p>
    <a href="${data.lienPaiement}" style="background:#FF6B35;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">
      Payer la 2ème tranche (15 000 FCFA)
    </a>
  </p>
  <hr>
  <p style="color:#888;font-size:12px;">Email automatique — Premier Pas Vers Le Jeu</p>
</body>
</html>`;
}

export function templateNotificationAdmin(data: {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  age: number;
  professionnel: boolean;
  dejaForme: boolean;
  transactionId: string;
  datePaiement: Date;
  id: string;
  modePaiement?: string;
  modeParticipation?: string;
  typeNotif?: string;
}) {
  const titre = data.typeNotif || 'Nouvelle inscription payée';
  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>${titre}</h2>
  <p><strong>Participant :</strong> ${data.nom} ${data.prenoms}</p>
  <p><strong>Email :</strong> ${data.email}</p>
  <p><strong>Téléphone :</strong> ${data.telephone}</p>
  <p><strong>Age :</strong> ${data.age} ans</p>
  <p><strong>Professionnel :</strong> ${data.professionnel ? 'Oui' : 'Non'}</p>
  <p><strong>Déjà formé :</strong> ${data.dejaForme ? 'Oui' : 'Non'}</p>
  <p><strong>Mode :</strong> ${data.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel'}</p>
  <p><strong>Paiement :</strong> ${data.modePaiement === 'TRANCHE' ? 'En 2 tranches' : 'Complet (30 000 FCFA)'}</p>
  <p><strong>Référence :</strong> ${data.transactionId}</p>
  <p><strong>Date :</strong> ${new Date(data.datePaiement).toLocaleDateString('fr-FR')}</p>
  <p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/inscriptions"
       style="background:#FF6B35;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      Voir dans le dashboard
    </a>
  </p>
  <hr>
  <p style="color:#888;font-size:12px;">Email automatique — Premier Pas Vers Le Jeu</p>
</body>
</html>`;
}

export function templateRelance(data: { prenoms: string; lienPaiement: string }) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>Votre inscription à PREMIER PAS VERS LE JEU</h2>
  <p>Bonjour <strong>${data.prenoms}</strong>,</p>
  <p>Nous avons bien enregistré votre pré-inscription, mais le paiement n'a pas encore été finalisé.</p>
  <div style="background:#FFF3CD;border-left:4px solid #FF6B35;padding:15px;margin:20px 0;">
    <p style="margin:0;"><strong>Places limitées !</strong> Ne perdez pas votre place.</p>
  </div>
  <p>
    <a href="${data.lienPaiement}" style="background:#FF6B35;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">
      Finaliser mon paiement maintenant
    </a>
  </p>
  <p style="margin-top:30px;color:#666;">Tarif : 30 000 FCFA | Dates : 24-27 Juin 2025</p>
  <hr>
  <p style="color:#888;font-size:12px;">Vous recevez cet email car vous avez commencé une inscription sur notre site.</p>
</body>
</html>`;
}

export function templateNotificationAction(data: { typeAction: string; details: string }) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>Nouvelle action sur le site</h2>
  <p><strong>Type :</strong> ${data.typeAction}</p>
  <div style="background:#f9f9f9;padding:15px;border-left:4px solid #FF6B35;margin:15px 0;">
    ${data.details}
  </div>
  <p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="background:#FF6B35;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      Voir le dashboard
    </a>
  </p>
  <hr>
  <p style="color:#888;font-size:12px;">Email automatique — Premier Pas Vers Le Jeu</p>
</body>
</html>`;
}

export function templateDemandePartenariat(data: {
  nom: string;
  organisation: string;
  email: string;
  telephone: string;
  message: string;
  type: string;
}) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>Nouvelle demande de ${data.type === 'SPONSOR' ? 'sponsoring' : 'partenariat'}</h2>
  <p><strong>Nom :</strong> ${data.nom}</p>
  <p><strong>Organisation :</strong> ${data.organisation}</p>
  <p><strong>Email :</strong> ${data.email}</p>
  <p><strong>Téléphone :</strong> ${data.telephone}</p>
  <p><strong>Message :</strong></p>
  <blockquote style="border-left:4px solid #FF6B35;padding:10px 15px;margin:10px 0;background:#f9f9f9;">${data.message}</blockquote>
  <p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/partenaires" style="background:#FF6B35;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      Gérer les demandes
    </a>
  </p>
  <hr>
  <p style="color:#888;font-size:12px;">Email automatique — Premier Pas Vers Le Jeu</p>
</body>
</html>`;
}
