import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getClientIp } from '@/lib/utils';
import sharp from 'sharp';

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

async function compressImage(buffer: Buffer): Promise<{ base64: string; mimeType: string; size: number }> {
  let quality = 80;
  let compressed = await sharp(buffer)
    .resize(800, 800, { fit: 'cover', position: 'center' })
    .jpeg({ quality, progressive: true })
    .toBuffer();

  if (compressed.length > 500000) {
    quality = 70;
    compressed = await sharp(buffer)
      .resize(800, 800, { fit: 'cover' })
      .jpeg({ quality })
      .toBuffer();
  }

  return {
    base64: compressed.toString('base64'),
    mimeType: 'image/jpeg',
    size: compressed.length,
  };
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

    if (!nom || !prenoms || !telephone || !email || !age || motivation === null) {
      return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
    }

    let photoBase64: string | null = null;
    let photoMimeType: string | null = null;
    let photoSize: number | null = null;

    if (photoFile && photoFile.size > 0) {
      const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED.includes(photoFile.type)) {
        return NextResponse.json({ error: 'Format photo non supporté.' }, { status: 400 });
      }
      if (photoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Photo trop volumineuse (max 5MB).' }, { status: 400 });
      }
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const compressed = await compressImage(buffer);
      photoBase64 = compressed.base64;
      photoMimeType = compressed.mimeType;
      photoSize = compressed.size;
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
        photoBase64,
        photoMimeType,
        photoSize,
        statut: 'EN_ATTENTE_PAIEMENT',
        sourceUtm,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent'),
        dateInscription: new Date(),
      },
    });

    return NextResponse.json({ inscriptionId: inscription.id }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création inscription:', error);
    return NextResponse.json({ error: 'Erreur serveur. Veuillez réessayer.' }, { status: 500 });
  }
}