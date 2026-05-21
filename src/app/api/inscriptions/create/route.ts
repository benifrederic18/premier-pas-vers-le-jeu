import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getClientIp } from '@/lib/utils';
import { envoyerEmail, templateNotificationAction } from '@/lib/email';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (record.count >= 10) return false;
  record.count++;
  return true;
}

async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  // Compresser avant upload
  const compressed = await sharp(buffer)
    .resize(800, 800, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error || !result) reject(error || new Error('Upload failed'));
        else resolve(result.secure_url);
      }
    ).end(compressed);
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques instants.' }, { status: 429 });
  }

  try {
    const formData = await req.formData();

    const nom = formData.get('nom') as string;
    const prenoms = formData.get('prenoms') as string;
    const telephone = formData.get('telephone') as string;
    const email = formData.get('email') as string;
    const age = parseInt(formData.get('age') as string);
    const dejaForme = formData.get('dejaForme') === 'true';
    const professionnel = formData.get('professionnel') === 'true';
    const motivation = formData.get('motivation') as string;
    const photoFile = formData.get('photo') as File | null;
    const sourceUtm = (formData.get('utm_source') as string) || req.nextUrl.searchParams.get('utm_source') || null;
    const modeParticipation = (formData.get('modeParticipation') as string) || 'PRESENTIEL';
    const modePaiement = (formData.get('modePaiement') as string) || 'COMPLET';

    if (!nom || !prenoms || !telephone || !email || !age || motivation === null) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    let photoUrl: string | null = null;

    if (photoFile && photoFile.size > 0) {
      const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED.includes(photoFile.type)) {
        return NextResponse.json({ error: 'Format photo non supporté.' }, { status: 400 });
      }
      if (photoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Photo trop volumineuse (max 5MB).' }, { status: 400 });
      }
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      photoUrl = await uploadToCloudinary(buffer, 'ppvlj/participants');
    }

    const inscription = await prisma.inscription.create({
      data: {
        nom,
        prenoms,
        telephone,
        email,
        age,
        dejaForme,
        professionnel,
        motivation,
        photoUrl,
        statut: 'EN_ATTENTE_PAIEMENT',
        modeParticipation: modeParticipation as any,
        modePaiement: modePaiement as any,
        sourceUtm,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent'),
        dateInscription: new Date(),
      },
    });

    const adminEmail = process.env.EMAIL_ADMIN || process.env.GMAIL_USER;
    if (adminEmail) {
      envoyerEmail({
        destinataire: adminEmail,
        nom: 'Admin',
        sujet: `📝 Nouvelle inscription — ${nom} ${prenoms}`,
        htmlContent: templateNotificationAction({
          typeAction: 'Nouvelle inscription',
          details: `<p><strong>Nom :</strong> ${nom} ${prenoms}</p>
<p><strong>Email :</strong> ${email}</p>
<p><strong>Téléphone :</strong> ${telephone}</p>
<p><strong>Mode :</strong> ${modeParticipation === 'EN_LIGNE' ? 'En ligne' : 'Présentiel'}</p>
<p><strong>Paiement :</strong> ${modePaiement === 'TRANCHE' ? 'En 2 tranches' : 'Complet'}</p>`,
        }),
        typeEmail: 'NOTIFICATION_ACTION',
        inscriptionId: inscription.id,
      }).catch(console.error);
    }

    return NextResponse.json({ inscriptionId: inscription.id }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création inscription:', error);
    return NextResponse.json({ error: 'Erreur serveur. Veuillez réessayer.' }, { status: 500 });
  }
}
