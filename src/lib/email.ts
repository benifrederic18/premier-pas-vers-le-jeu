import nodemailer from 'nodemailer';
import { prisma } from './db';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

type TypeEmailValue =
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

interface EmailParams {
  destinataire: string;
  nom: string;
  sujet: string;
  htmlContent: string;
  typeEmail: TypeEmailValue;
  inscriptionId?: string;
}

// ── Core send function ────────────────────────────────────────────────────────

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

// ── DB template helper ────────────────────────────────────────────────────────

function applyVars(text: string, vars: Record<string, string | number | undefined>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));
}

async function getDbTemplate(cle: string, vars: Record<string, string | number | undefined> = {}): Promise<{ sujet: string; corps: string } | null> {
  try {
    const t = await prisma.templateEmail.findUnique({ where: { cle, actif: true } });
    if (!t) return null;
    return { sujet: applyVars(t.sujet, vars), corps: applyVars(t.corps, vars) };
  } catch {
    return null;
  }
}

// ── Wrapper: tries DB template first, falls back to hardcoded ─────────────────

async function sendWithTemplate(opts: {
  cle: string;
  typeEmail: TypeEmailValue;
  destinataire: string;
  inscriptionId?: string;
  vars: Record<string, string | number | undefined>;
  fallbackSujet: string;
  fallbackHtml: string;
}) {
  const tpl = await getDbTemplate(opts.cle, opts.vars);
  await envoyerEmail({
    destinataire: opts.destinataire,
    nom: String(opts.vars.prenoms ?? opts.vars.nom ?? ''),
    sujet: tpl ? tpl.sujet : opts.fallbackSujet,
    htmlContent: tpl ? tpl.corps : opts.fallbackHtml,
    typeEmail: opts.typeEmail,
    inscriptionId: opts.inscriptionId,
  });
}

// ── Named send functions ──────────────────────────────────────────────────────

export async function sendConfirmationInscription(data: {
  prenoms: string; nom: string; email: string; telephone: string;
  transactionId: string; datePaiement: Date; modePaiement?: string;
  modeParticipation?: string; lienWhatsapp?: string | null;
  inscriptionId?: string; montant?: number;
}) {
  const modeLabel = data.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel';
  const paiementLabel = data.modePaiement === 'TRANCHE' ? '15 000 FCFA (1ère tranche)' : '30 000 FCFA';
  const montant = data.montant ?? (data.modePaiement === 'TRANCHE' ? 15000 : 30000);

  await sendWithTemplate({
    cle: 'CONFIRMATION_INSCRIPTION',
    typeEmail: 'CONFIRMATION_PAIEMENT',
    destinataire: data.email,
    inscriptionId: data.inscriptionId,
    vars: {
      prenoms: data.prenoms, nom: data.nom, email: data.email,
      telephone: data.telephone, montant, modeParticipation: modeLabel,
      lienWhatsapp: data.lienWhatsapp || '',
    },
    fallbackSujet: 'Confirmation de votre inscription — Premier Pas Vers Le Jeu',
    fallbackHtml: templateConfirmationParticipant({ ...data, lienWhatsapp: data.lienWhatsapp ?? null }),
  });
}

export async function sendTranche1Confirmee(data: {
  prenoms: string; nom: string; email: string; telephone: string;
  transactionId: string; datePaiement: Date; modeParticipation?: string;
  delaiJours?: number; inscriptionId?: string;
}) {
  const delai = data.delaiJours ?? 7;
  await sendWithTemplate({
    cle: 'TRANCHE1_CONFIRMEE',
    typeEmail: 'CONFIRMATION_PAIEMENT',
    destinataire: data.email,
    inscriptionId: data.inscriptionId,
    vars: { prenoms: data.prenoms, nom: data.nom, email: data.email, montant: 15000, delaiJours: delai },
    fallbackSujet: '1ère tranche confirmée — Premier Pas Vers Le Jeu',
    fallbackHtml: templateTranche1Confirmee(data),
  });
}

export async function sendRelancePaiement(data: {
  prenoms: string; nom: string; email: string; lienPaiement: string; inscriptionId?: string;
}) {
  await sendWithTemplate({
    cle: 'RELANCE_PAIEMENT',
    typeEmail: 'RELANCE_PAIEMENT',
    destinataire: data.email,
    inscriptionId: data.inscriptionId,
    vars: { prenoms: data.prenoms, nom: data.nom, email: data.email, lienPaiement: data.lienPaiement },
    fallbackSujet: 'Finalisez votre inscription — Premier Pas Vers Le Jeu',
    fallbackHtml: templateRelance(data),
  });
}

export async function sendRelanceTranche2(data: {
  prenoms: string; nom: string; email: string; lienPaiement: string; inscriptionId?: string;
}) {
  await sendWithTemplate({
    cle: 'RELANCE_TRANCHE2',
    typeEmail: 'RELANCE_TRANCHE2',
    destinataire: data.email,
    inscriptionId: data.inscriptionId,
    vars: { prenoms: data.prenoms, nom: data.nom, email: data.email, lienTranche2: data.lienPaiement, montant: 15000 },
    fallbackSujet: 'Rappel : 2ème tranche en attente — Premier Pas Vers Le Jeu',
    fallbackHtml: templateRelanceTranche2({ prenoms: data.prenoms, lienPaiement: data.lienPaiement }),
  });
}

export async function sendMomoInstructions(data: {
  prenoms: string; nom: string; email: string; montant: number;
  momoNumero: string; momoNom: string; momoWhatsapp: string; inscriptionId?: string;
}) {
  await sendWithTemplate({
    cle: 'ECHEC_PAIEMENT_MOMO',
    typeEmail: 'MOMO_INSTRUCTIONS',
    destinataire: data.email,
    inscriptionId: data.inscriptionId,
    vars: { ...data },
    fallbackSujet: 'Comment finaliser votre inscription — Paiement MoMo',
    fallbackHtml: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h2 style="color:#f97316;">📱 Finaliser votre inscription par MoMo</h2>
        <p>Bonjour <strong>${data.prenoms}</strong>,</p>
        <p>Le paiement en ligne n'a pas pu être traité. Effectuez un virement MoMo :</p>
        <ul>
          <li><strong>Numéro :</strong> ${data.momoNumero}</li>
          <li><strong>Nom :</strong> ${data.momoNom}</li>
          <li><strong>Montant :</strong> ${data.montant.toLocaleString('fr-FR')} FCFA</li>
        </ul>
        <p>Après le virement, envoyez une capture d'écran par WhatsApp au <strong>${data.momoWhatsapp}</strong>.</p>
      </div>`,
  });
}

export async function sendCodePaiementConfirmation(data: {
  prenoms: string; nom: string; email: string; montant: number;
  code: string; lienWhatsapp?: string | null; inscriptionId?: string;
}) {
  await sendWithTemplate({
    cle: 'PAIEMENT_CODE',
    typeEmail: 'PAIEMENT_CODE',
    destinataire: data.email,
    inscriptionId: data.inscriptionId,
    vars: { prenoms: data.prenoms, nom: data.nom, email: data.email, montant: data.montant, lienWhatsapp: data.lienWhatsapp || '' },
    fallbackSujet: 'Votre inscription est validée — Premier Pas Vers Le Jeu',
    fallbackHtml: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h2 style="color:#f97316;">🎭 Inscription confirmée !</h2>
        <p>Bonjour <strong>${data.prenoms}</strong>,</p>
        <p>Votre paiement de <strong>${data.montant.toLocaleString('fr-FR')} FCFA</strong> a été validé et votre inscription est confirmée.</p>
        ${data.lienWhatsapp ? `<p>Rejoignez notre groupe WhatsApp : <a href="${data.lienWhatsapp}">${data.lienWhatsapp}</a></p>` : ''}
        <p>Premier Pas Vers Le Jeu</p>
      </div>`,
  });
}

// ── Legacy hardcoded templates (kept for fallback) ────────────────────────────

export function templateConfirmationParticipant(data: {
  prenoms: string; nom: string; email: string; telephone: string;
  transactionId: string; datePaiement: Date; modePaiement?: string;
  modeParticipation?: string; lienWhatsapp?: string | null;
}) {
  const modeLabel = data.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel';
  const paiementLabel = data.modePaiement === 'TRANCHE' ? '15 000 FCFA (1ère tranche)' : '30 000 FCFA';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;}
    .container{max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;}
    .header{background:linear-gradient(135deg,#FF6B35,#F7931E);padding:40px;text-align:center;}
    .header h1{color:white;margin:0;font-size:24px;}
    .content{padding:30px;}
    .badge{background:#4CAF50;color:white;padding:8px 20px;border-radius:20px;display:inline-block;font-weight:bold;margin:10px 0;}
    .info-box{background:#f9f9f9;padding:20px;border-left:4px solid #FF6B35;margin:20px 0;border-radius:0 4px 4px 0;}
    .info-box p{margin:6px 0;}
    .btn{background:#25D366;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;margin:10px 0;}
    .footer{background:#0A0A0A;color:#888;padding:20px;text-align:center;font-size:12px;}
  </style></head><body>
  <div class="container">
    <div class="header"><h1>INSCRIPTION CONFIRMÉE</h1></div>
    <div class="content">
      <p>Bonjour <strong>${data.prenoms}</strong>,</p>
      <p>Félicitations ! Votre inscription à <strong>PREMIER PAS VERS LE JEU</strong> est confirmée.</p>
      <div class="badge">PAIEMENT VALIDÉ</div>
      <div class="info-box">
        <h3>Récapitulatif</h3>
        <p><strong>Nom :</strong> ${data.nom} ${data.prenoms}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Téléphone :</strong> ${data.telephone}</p>
        <p><strong>Mode :</strong> ${modeLabel}</p>
        <p><strong>Montant :</strong> ${paiementLabel}</p>
        <p><strong>Référence :</strong> ${data.transactionId}</p>
        <p><strong>Date :</strong> ${new Date(data.datePaiement).toLocaleDateString('fr-FR')}</p>
      </div>
      ${data.lienWhatsapp ? `<div style="text-align:center;margin:24px 0;"><a href="${data.lienWhatsapp}" class="btn">💬 Rejoindre le groupe WhatsApp</a></div>` : ''}
      <p>Pour toute question : ${process.env.GMAIL_USER}</p>
    </div>
    <div class="footer"><p>&copy; 2025 Premier Pas Vers Le Jeu.</p></div>
  </div></body></html>`;
}

export function templateTranche1Confirmee(data: {
  prenoms: string; nom: string; email: string; telephone: string;
  transactionId: string; datePaiement: Date; modeParticipation?: string; delaiJours?: number;
}) {
  const modeLabel = data.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel';
  const delai = data.delaiJours ?? 7;
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:20px;">
  <h2 style="color:#FF6B35;">1ÈRE TRANCHE CONFIRMÉE ✅</h2>
  <p>Bonjour <strong>${data.prenoms}</strong>,</p>
  <p>Votre 1ère tranche de <strong>15 000 FCFA</strong> a bien été reçue !</p>
  <p><strong>Mode :</strong> ${modeLabel} | <strong>Référence :</strong> ${data.transactionId}</p>
  <div style="background:#FFF3CD;border-left:4px solid #FF6B35;padding:15px;margin:20px 0;">
    <p style="margin:0;"><strong>Important :</strong> Vous recevrez un rappel dans ${delai} jour(s) pour régler la 2ème tranche de 15 000 FCFA.</p>
  </div>
  <p>Pour toute question : ${process.env.GMAIL_USER}</p>
  </body></html>`;
}

export function templateRelanceTranche2(data: { prenoms: string; lienPaiement: string }) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>Rappel : 2ème tranche en attente</h2>
  <p>Bonjour <strong>${data.prenoms}</strong>,</p>
  <p>Il vous reste <strong>15 000 FCFA</strong> à payer pour finaliser votre inscription.</p>
  <p><a href="${data.lienPaiement}" style="background:#FF6B35;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">Payer la 2ème tranche</a></p>
  <hr><p style="color:#888;font-size:12px;">Premier Pas Vers Le Jeu</p>
  </body></html>`;
}

export function templateNotificationAdmin(data: {
  nom: string; prenoms: string; email: string; telephone: string; age: number;
  professionnel: boolean; dejaForme: boolean; transactionId: string;
  datePaiement: Date; id: string; modePaiement?: string; modeParticipation?: string; typeNotif?: string;
}) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>${data.typeNotif || 'Nouvelle inscription payée'}</h2>
  <p><strong>Participant :</strong> ${data.nom} ${data.prenoms}</p>
  <p><strong>Email :</strong> ${data.email} | <strong>Tél :</strong> ${data.telephone}</p>
  <p><strong>Âge :</strong> ${data.age} ans | <strong>Pro :</strong> ${data.professionnel ? 'Oui' : 'Non'} | <strong>Déjà formé :</strong> ${data.dejaForme ? 'Oui' : 'Non'}</p>
  <p><strong>Mode :</strong> ${data.modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel'} | <strong>Paiement :</strong> ${data.modePaiement === 'TRANCHE' ? '2 tranches' : 'Complet 30 000 FCFA'}</p>
  <p><strong>Réf :</strong> ${data.transactionId} | <strong>Date :</strong> ${new Date(data.datePaiement).toLocaleDateString('fr-FR')}</p>
  <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/inscriptions" style="background:#FF6B35;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Voir dans le dashboard</a></p>
  <hr><p style="color:#888;font-size:12px;">Email automatique — Premier Pas Vers Le Jeu</p>
  </body></html>`;
}

export function templateRelance(data: { prenoms: string; lienPaiement: string }) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>Finalisez votre inscription — PREMIER PAS VERS LE JEU</h2>
  <p>Bonjour <strong>${data.prenoms}</strong>,</p>
  <p>Votre pré-inscription a bien été enregistrée, mais le paiement n'a pas encore été finalisé.</p>
  <p><a href="${data.lienPaiement}" style="background:#FF6B35;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;display:inline-block;font-weight:bold;">Finaliser mon paiement</a></p>
  <hr><p style="color:#888;font-size:12px;">Premier Pas Vers Le Jeu</p>
  </body></html>`;
}

export function templateNotificationAction(data: { typeAction: string; details: string }) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>Nouvelle action : ${data.typeAction}</h2>
  <div style="background:#f9f9f9;padding:15px;border-left:4px solid #FF6B35;margin:15px 0;">${data.details}</div>
  <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="background:#FF6B35;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Voir le dashboard</a></p>
  </body></html>`;
}

export function templateDemandePartenariat(data: {
  nom: string; organisation: string; email: string; telephone: string; message: string; type: string;
}) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:20px;">
  <h2>Nouvelle demande de ${data.type === 'SPONSOR' ? 'sponsoring' : 'partenariat'}</h2>
  <p><strong>Nom :</strong> ${data.nom} | <strong>Org :</strong> ${data.organisation}</p>
  <p><strong>Email :</strong> ${data.email} | <strong>Tél :</strong> ${data.telephone}</p>
  <blockquote style="border-left:4px solid #FF6B35;padding:10px 15px;background:#f9f9f9;">${data.message}</blockquote>
  <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/partenaires" style="background:#FF6B35;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Gérer les demandes</a></p>
  </body></html>`;
}
