import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DEFAULT_TEMPLATES = [
  {
    cle: 'CONFIRMATION_INSCRIPTION',
    nom: 'Confirmation inscription',
    sujet: 'Confirmation de votre inscription — Premier Pas Vers Le Jeu',
    corps: `<p>Bonjour {{prenoms}},</p>
<p>Votre inscription à la formation <strong>Premier Pas Vers Le Jeu</strong> a bien été enregistrée et votre paiement confirmé.</p>
<p><strong>Montant payé :</strong> {{montant}} FCFA</p>
<p>Nous vous contacterons très bientôt avec les détails de la formation.</p>
<p>À très bientôt,<br>L'équipe Premier Pas Vers Le Jeu</p>`,
  },
  {
    cle: 'RELANCE_PAIEMENT',
    nom: 'Relance paiement en attente',
    sujet: 'Votre inscription est incomplète — Finalisez votre paiement',
    corps: `<p>Bonjour {{prenoms}},</p>
<p>Vous avez commencé votre inscription à la formation <strong>Premier Pas Vers Le Jeu</strong> mais votre paiement n'a pas encore été finalisé.</p>
<p>Cliquez sur le lien ci-dessous pour compléter votre paiement :</p>
<p><a href="{{lienPaiement}}" style="color:#f97316;">Finaliser mon paiement →</a></p>
<p>L'équipe Premier Pas Vers Le Jeu</p>`,
  },
  {
    cle: 'TRANCHE1_CONFIRMEE',
    nom: '1ère tranche confirmée',
    sujet: '1ère tranche reçue — Pensez à régler la 2ème',
    corps: `<p>Bonjour {{prenoms}},</p>
<p>Votre 1ère tranche de <strong>{{montant}} FCFA</strong> a bien été reçue. Merci !</p>
<p>N'oubliez pas de régler la 2ème tranche avant le début de la formation.</p>
<p>L'équipe Premier Pas Vers Le Jeu</p>`,
  },
  {
    cle: 'RELANCE_TRANCHE2',
    nom: 'Relance 2ème tranche',
    sujet: 'Rappel : 2ème tranche de paiement à régler',
    corps: `<p>Bonjour {{prenoms}},</p>
<p>Nous vous rappelons que votre 2ème tranche de paiement est en attente.</p>
<p>Cliquez ici pour régler : <a href="{{lienTranche2}}" style="color:#f97316;">Payer ma 2ème tranche →</a></p>
<p>L'équipe Premier Pas Vers Le Jeu</p>`,
  },
  {
    cle: 'LIEN_WHATSAPP',
    nom: 'Envoi lien WhatsApp',
    sujet: 'Rejoignez notre groupe WhatsApp — Premier Pas Vers Le Jeu',
    corps: `<p>Bonjour {{prenoms}},</p>
<p>Félicitations ! Votre inscription est complète. Rejoignez notre groupe WhatsApp pour ne rien manquer :</p>
<p><a href="{{lienWhatsapp}}" style="color:#f97316;">Rejoindre le groupe WhatsApp →</a></p>
<p>L'équipe Premier Pas Vers Le Jeu</p>`,
  },
  {
    cle: 'ECHEC_PAIEMENT_MOMO',
    nom: 'Instructions paiement MoMo',
    sujet: 'Complétez votre inscription — Paiement MoMo',
    corps: `<p>Bonjour {{prenoms}},</p>
<p>Votre paiement en ligne n'a pas pu être traité. Vous pouvez effectuer un paiement direct par MoMo :</p>
<ul>
  <li><strong>Numéro MoMo :</strong> {{momoNumero}}</li>
  <li><strong>Nom du compte :</strong> {{momoNom}}</li>
  <li><strong>Montant :</strong> {{montant}} FCFA</li>
</ul>
<p>Après paiement, envoyez une capture d'écran par WhatsApp au <strong>{{momoWhatsapp}}</strong> en précisant votre nom complet.</p>
<p>L'équipe Premier Pas Vers Le Jeu</p>`,
  },
  {
    cle: 'PAIEMENT_CODE',
    nom: 'Confirmation paiement direct (code)',
    sujet: 'Votre inscription est validée — Premier Pas Vers Le Jeu',
    corps: `<p>Bonjour {{prenoms}},</p>
<p>Votre paiement de <strong>{{montant}} FCFA</strong> a été validé et votre inscription est confirmée.</p>
<p>Nous avons hâte de vous accueillir !</p>
<p>L'équipe Premier Pas Vers Le Jeu</p>`,
  },
];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const existing = await prisma.templateEmail.findMany({ orderBy: { cle: 'asc' } });

  if (existing.length === 0) {
    // Seed defaults on first access
    await prisma.templateEmail.createMany({ data: DEFAULT_TEMPLATES });
    return NextResponse.json(await prisma.templateEmail.findMany({ orderBy: { cle: 'asc' } }));
  }

  return NextResponse.json(existing);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const { id, sujet, corps, actif } = body;

  if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 });

  const updated = await prisma.templateEmail.update({
    where: { id },
    data: { sujet, corps, actif: actif !== false },
  });

  return NextResponse.json(updated);
}
