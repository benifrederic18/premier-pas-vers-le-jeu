import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { envoyerEmail, templateDemandePartenariat } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, organisation, email, telephone, message, type } = body;

    if (!nom || !organisation || !email || !telephone || !message) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 });
    }

    const demande = await prisma.demandePartenariat.create({
      data: { nom, organisation, email, telephone, message, type: type || 'PARTENAIRE' },
    });

    const adminEmail = process.env.EMAIL_ADMIN || process.env.GMAIL_USER;
    if (adminEmail) {
      envoyerEmail({
        destinataire: adminEmail,
        nom: 'Admin',
        sujet: `🤝 Nouvelle demande de ${type === 'SPONSOR' ? 'sponsoring' : 'partenariat'} — ${organisation}`,
        htmlContent: templateDemandePartenariat({ nom, organisation, email, telephone, message, type: type || 'PARTENAIRE' }),
        typeEmail: 'NOTIFICATION_SPONSOR',
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, id: demande.id }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur demande partenariat:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sponsors = await prisma.sponsor.findMany({
    where: { actif: true },
    orderBy: [{ ordre: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, nom: true, logoUrl: true, siteWeb: true, type: true, description: true },
  });
  return NextResponse.json(sponsors);
}
