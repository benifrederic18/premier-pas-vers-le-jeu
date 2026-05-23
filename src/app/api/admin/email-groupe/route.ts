import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { envoyerEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { sujet, htmlContent, destinataires } = await req.json();

  if (!sujet || !htmlContent || !destinataires) {
    return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
  }

  let where: any = {};
  if (destinataires === 'PAYES') where.statut = 'PAYE';
  if (destinataires === 'NON_PAYES') where.statut = 'EN_ATTENTE_PAIEMENT';
  if (destinataires === 'TRANCHE1') where.statut = 'TRANCHE1_PAYEE';

  const inscrits = await prisma.inscription.findMany({
    where,
    select: { id: true, nom: true, prenoms: true, email: true, telephone: true },
  });

  let envoyes = 0;
  let echecs = 0;

  for (const inscrit of inscrits) {
    try {
      const html = htmlContent
        .replace(/\{\{prenoms\}\}/g, inscrit.prenoms)
        .replace(/\{\{nom\}\}/g, inscrit.nom)
        .replace(/\{\{email\}\}/g, inscrit.email)
        .replace(/\{\{telephone\}\}/g, inscrit.telephone);

      await envoyerEmail({
        destinataire: inscrit.email,
        nom: `${inscrit.prenoms} ${inscrit.nom}`,
        sujet,
        htmlContent: html,
        typeEmail: 'EMAIL_GROUPE',
        inscriptionId: inscrit.id,
      });
      envoyes++;
    } catch {
      echecs++;
    }
  }

  return NextResponse.json({ envoyes, echecs, total: inscrits.length });
}