import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';
import { sendCodeInvitation, sendCodePaiementConfirmation, envoyerEmail } from '@/lib/email';

function generateCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const codes = await prisma.codePaiement.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(codes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const body = await req.json();
  const { email, nomApprenant, montant } = body;

  if (!email || !nomApprenant || !montant) {
    return NextResponse.json({ error: 'Email, nom et montant requis.' }, { status: 400 });
  }

  const montantNum = parseFloat(montant);

  // ── Cas 1 : inscription existante (paiement échoué ou en attente) ──────────
  const existingInscription = await prisma.inscription.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      statut: { in: ['EN_ATTENTE_PAIEMENT', 'ECHEC_PAIEMENT'] },
    },
    orderBy: { dateInscription: 'desc' },
  });

  if (existingInscription) {
    const ref = `DIRECT-ADMIN-${Date.now()}`;
    const updated = await prisma.inscription.update({
      where: { id: existingInscription.id },
      data: {
        statut: 'PAYE',
        montantPaye: montantNum,
        datePaiement: new Date(),
        emailConfirmationEnvoye: true,
        transactionId: ref,
        modePaiement: 'COMPLET',
      },
    });

    const params = await prisma.parametresSite.findFirst();
    const adminEmail = process.env.EMAIL_ADMIN || process.env.GMAIL_USER;

    await Promise.allSettled([
      sendCodePaiementConfirmation({
        prenoms: updated.prenoms,
        nom: updated.nom,
        email: updated.email,
        montant: montantNum,
        code: ref,
        lienWhatsapp: params?.lienWhatsapp ?? null,
        inscriptionId: updated.id,
      }),
      adminEmail
        ? envoyerEmail({
            destinataire: adminEmail,
            nom: 'Admin',
            sujet: `✅ Paiement direct validé — ${updated.prenoms} ${updated.nom}`,
            htmlContent: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2>✅ Inscription validée directement par l'admin</h2>
                <p><strong>Apprenant :</strong> ${updated.prenoms} ${updated.nom}</p>
                <p><strong>Email :</strong> ${updated.email}</p>
                <p><strong>Téléphone :</strong> ${updated.telephone}</p>
                <p><strong>Montant :</strong> ${montantNum.toLocaleString('fr-FR')} FCFA</p>
                <p><strong>Validé par :</strong> ${(session.user as any).email || 'admin'}</p>
                <p><strong>Référence :</strong> ${ref}</p>
              </div>`,
            typeEmail: 'NOTIFICATION_ADMIN',
            inscriptionId: updated.id,
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json({
      type: 'DIRECT_VALIDATION',
      inscriptionId: updated.id,
      prenoms: updated.prenoms,
      nom: updated.nom,
      email: updated.email,
    });
  }

  // ── Cas 2 : aucune inscription existante → générer un code ─────────────────
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.codePaiement.findUnique({ where: { code } });
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  const cp = await prisma.codePaiement.create({
    data: {
      code,
      email,
      nomApprenant,
      montant: montantNum,
      createdBy: (session.user as any).email || 'admin',
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const lienInscription = `${baseUrl}/?code=${code}#inscription`;
  const [prenoms, ...restNom] = nomApprenant.split(' ');
  try {
    await sendCodeInvitation({
      prenoms: prenoms || nomApprenant,
      nom: restNom.join(' ') || nomApprenant,
      email,
      montant: montantNum,
      code,
      lienInscription,
    });
  } catch {}

  return NextResponse.json({ type: 'CODE_GENERATED', ...cp }, { status: 201 });
}
