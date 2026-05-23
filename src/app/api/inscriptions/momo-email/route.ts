import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { envoyerEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { inscriptionId, montant } = await req.json();

    const inscription = await prisma.inscription.findUnique({ where: { id: inscriptionId } });
    if (!inscription) return NextResponse.json({ error: 'Inscription introuvable.' }, { status: 404 });

    const params = await prisma.parametresSite.findFirst();
    if (!params?.momoActif || !params.momoNumero) {
      return NextResponse.json({ error: 'MoMo non configuré.' }, { status: 400 });
    }

    await envoyerEmail({
      destinataire: inscription.email,
      nom: `${inscription.prenoms} ${inscription.nom}`,
      sujet: 'Comment finaliser votre inscription — Paiement MoMo',
      htmlContent: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px;">
          <h2 style="color:#f97316;">📱 Finaliser votre inscription par MoMo</h2>
          <p style="color:#d1d5db;">Bonjour <strong>${inscription.prenoms}</strong>,</p>
          <p style="color:#d1d5db;">Le paiement en ligne n'a pas pu être traité. Voici comment finaliser votre inscription :</p>
          <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #333;">
            <p style="color:#f97316;font-weight:bold;margin:0 0 12px;">Effectuez un virement MoMo</p>
            <p style="color:#9ca3af;margin:6px 0;">📱 <strong style="color:#fff;">Numéro :</strong> ${params.momoNumero}</p>
            <p style="color:#9ca3af;margin:6px 0;">👤 <strong style="color:#fff;">Nom :</strong> ${params.momoNom || ''}</p>
            <p style="color:#9ca3af;margin:6px 0;">💰 <strong style="color:#fff;">Montant :</strong> ${(montant || 30000).toLocaleString('fr-FR')} FCFA</p>
          </div>
          <p style="color:#d1d5db;">Après le virement, <strong>envoyez une capture d'écran de la confirmation par WhatsApp</strong> au ${params.momoWhatsapp || ''} en indiquant votre nom complet.</p>
          <p style="color:#6b7280;font-size:13px;margin-top:32px;">Premier Pas Vers Le Jeu</p>
        </div>
      `,
      typeEmail: 'MOMO_INSTRUCTIONS',
      inscriptionId: inscription.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur envoi email.' }, { status: 500 });
  }
}
