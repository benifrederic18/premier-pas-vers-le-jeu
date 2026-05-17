import { BrevoClient } from '@getbrevo/brevo';
import { prisma } from './db';

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

interface EmailParams {
  destinataire: string;
  nom: string;
  sujet: string;
  htmlContent: string;
  typeEmail: 'CONFIRMATION_PAIEMENT' | 'RELANCE_PAIEMENT' | 'EMAIL_GROUPE' | 'NOTIFICATION_ADMIN';
  inscriptionId?: string;
}

export async function envoyerEmail({ destinataire, nom, sujet, htmlContent, typeEmail, inscriptionId }: EmailParams) {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: sujet,
      htmlContent,
      sender: {
        name: process.env.NEXT_PUBLIC_SITE_NAME!,
        email: process.env.EMAIL_FROM!,
      },
      to: [{ email: destinataire, name: nom }],
    } as any);

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
}) {
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
    .footer { background: #0A0A0A; color: #888; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>INSCRIPTION CONFIRMEE</h1></div>
    <div class="content">
      <p>Bonjour <strong>${data.prenoms}</strong>,</p>
      <p>Felicitations ! Votre inscription a la formation <strong>PREMIER PAS VERS LE JEU</strong> a ete confirmee avec succes.</p>
      <div class="badge">PAIEMENT VALIDE</div>
      <div class="info-box">
        <h3>Recapitulatif</h3>
        <p><strong>Nom complet :</strong> ${data.nom} ${data.prenoms}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Telephone :</strong> ${data.telephone}</p>
        <p><strong>Montant paye :</strong> 30.000 FCFA</p>
        <p><strong>Reference :</strong> ${data.transactionId}</p>
        <p><strong>Date :</strong> ${new Date(data.datePaiement).toLocaleDateString('fr-FR')}</p>
      </div>
      <div class="info-box">
        <h3>Informations pratiques</h3>
        <p><strong>Dates :</strong> 24 au 27 Juin 2025</p>
        <p><strong>Horaires :</strong> 9h00 - 17h00</p>
        <p><strong>Lieu :</strong> Cotonou, Benin</p>
      </div>
      <p>Pour toute question : contact@premierpasverslejeu.com</p>
      <p>A tres bientot !</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Premier Pas Vers Le Jeu.</p>
      <p>Cet email a ete envoye a ${data.email}</p>
    </div>
  </div>
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
}) {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Nouvelle inscription payee</h2>
  <p><strong>Participant :</strong> ${data.nom} ${data.prenoms}</p>
  <p><strong>Email :</strong> ${data.email}</p>
  <p><strong>Telephone :</strong> ${data.telephone}</p>
  <p><strong>Age :</strong> ${data.age} ans</p>
  <p><strong>Professionnel :</strong> ${data.professionnel ? 'Oui' : 'Non'}</p>
  <p><strong>Deja forme :</strong> ${data.dejaForme ? 'Oui' : 'Non'}</p>
  <p><strong>Montant :</strong> 30.000 FCFA</p>
  <p><strong>Reference :</strong> ${data.transactionId}</p>
  <p><strong>Date :</strong> ${new Date(data.datePaiement).toLocaleDateString('fr-FR')}</p>
  <p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/inscriptions/${data.id}"
       style="background:#FF6B35;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      Voir dans le dashboard
    </a>
  </p>
  <hr>
  <p style="color:#888;font-size:12px;">Email automatique</p>
</body>
</html>`;
}

export function templateRelance(data: { prenoms: string; lienPaiement: string }) {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Votre inscription a PREMIER PAS VERS LE JEU</h2>
  <p>Bonjour <strong>${data.prenoms}</strong>,</p>
  <p>Nous avons bien enregistre votre pre-inscription, mais le paiement n'a pas encore ete finalise.</p>
  <div style="background:#FFF3CD;border-left:4px solid #FF6B35;padding:15px;margin:20px 0;">
    <p style="margin:0;"><strong>Places limitees !</strong> Ne perdez pas votre place.</p>
  </div>
  <p>
    <a href="${data.lienPaiement}"
       style="background:#FF6B35;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">
      Finaliser mon paiement maintenant
    </a>
  </p>
  <p style="margin-top:30px;color:#666;">Tarif : 30.000 FCFA | Dates : 24-27 Juin 2025</p>
  <hr>
  <p style="color:#888;font-size:12px;">Vous recevez cet email car vous avez commence une inscription sur notre site.</p>
</body>
</html>`;
}